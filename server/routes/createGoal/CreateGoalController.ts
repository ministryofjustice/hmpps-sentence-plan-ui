import { NextFunction, Request, Response } from 'express'
import ReferentialDataService from '../../services/sentence-plan/referentialDataService'
import locale from './locale.json'
import InfoService from '../../services/sentence-plan/infoService'
import NoteService from '../../services/sentence-plan/noteService'
import URLs from '../URLs'
import { FORMS } from '../../services/formStorageService'
import GoalService from '../../services/sentence-plan/goalService'
import { NewGoal } from '../../@types/NewGoalType'

export default class CreateGoalController {
  constructor(
    private readonly referentialDataService: ReferentialDataService,
    private readonly infoService: InfoService,
    private readonly noteService: NoteService,
    private readonly goalService: GoalService,
  ) {}

  private saveAndRedirect = async (req: Request, res: Response, next: NextFunction) => {
    req.services.formStorageService.saveFormData(FORMS.CREATE_GOAL, {
      processed: this.processGoalData(req.body),
      raw: req.body,
    })
    const processedData: NewGoal = this.processGoalData(req.body)
    const planUuid = req.services.sessionService.getPlanUUID()
    const { uuid } = await this.goalService.saveGoal(processedData, planUuid)
    req.services.formStorageService.saveFormData('currentGoal', {
      processed: null,
      raw: { uuid },
    })
    const redirectUrl: string = req.body.action === 'addStep' ? URLs.CREATE_STEP : URLs.SUMMARY
    return res.redirect(redirectUrl)
  }

  private render = async (req: Request, res: Response, next: NextFunction) => {
    const crn = 'ABC123XYZ' // TODO: This is likely to be a session value, get from there
    const { areaOfNeed } = req.params
    const { errors } = req

    try {
      const allAreaOfNeed = this.referentialDataService.getAreasOfNeed()
      const navigationLinks = allAreaOfNeed.map(aon => ({
        text: aon.name,
        href: aon.url,
        active: aon.url === areaOfNeed,
      }))
      const selectedOtherAreaOfNeed: string[] = req.body['other-area-of-need'] || []
      const otherAreaOfNeed = allAreaOfNeed
        .filter(aon => aon.url !== areaOfNeed)
        .map(({ id, name }) => ({ text: name, value: id, checked: selectedOtherAreaOfNeed.includes(id.toString()) }))
      const displayAreaOfNeed = this.referentialDataService
        .getAreasOfNeed()
        .filter(aon => aon.url === areaOfNeed)[0].name
      const dateOptionsDate = this.getAchieveDateOptions(new Date())
      dateOptionsDate.push(new Date(new Date().setDate(new Date().getDate() + 7)))
      const referenceData = this.referentialDataService.getGoals(areaOfNeed)
      const [popData, noteData] = await Promise.all([
        this.infoService.getPopData(crn),
        this.noteService.getNoteDataByAreaOfNeed(areaOfNeed, crn),
      ])
      return res.render('pages/create-goal', {
        locale: locale.en,
        data: {
          navigationLinks,
          displayAreaOfNeed,
          areaOfNeed,
          popData,
          referenceData,
          noteData,
          dateOptionsDate,
          otherAreaOfNeed,
          form: req.body,
        },
        errors,
      })
    } catch (e) {
      return next(e)
    }
  }

  private displayableDateFormat(date: Date): string {
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).format(date)
  }

  private processGoalData(body: any) {
    const title = body['input-autocomplete']
    const targetDate =
      body['date-selection-radio'] === 'custom' ? body['date-selection-custom'] : body['date-selection-radio']
    const areaOfNeed = body['area-of-need']
    const relatedAreasOfNeed = body['other-area-of-need-radio'] === 'yes' ? body['other-area-of-need'] : undefined

    return {
      title,
      areaOfNeed,
      targetDate,
      relatedAreasOfNeed,
    }
  }

  private getAchieveDateOptions = (date: Date, dateOptionsInMonths = [3, 6, 12, 24]) => {
    return dateOptionsInMonths.map(option => {
      const achieveDate = new Date(date)
      achieveDate.setMonth(date.getMonth() + option)
      return achieveDate
    })
  }

  public get = this.render

  post = (req: Request, res: Response, next: NextFunction) => {
    if (Object.keys(req.errors.body).length) {
      return this.render(req, res, next)
    }
    return this.saveAndRedirect(req, res, next)
  }
}
