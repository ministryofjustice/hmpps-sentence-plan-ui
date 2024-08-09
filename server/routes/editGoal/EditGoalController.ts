import { NextFunction, Request, Response } from 'express'
import locale from '../createGoal/locale.json'
import GoalService from '../../services/sentence-plan/goalService'
import URLs from '../URLs'
import NoteService from '../../services/sentence-plan/noteService'
import ReferentialDataService from '../../services/sentence-plan/referentialDataService'
import { dateToISOFormat, formatDateWithStyle, getAchieveDateOptions } from '../../utils/utils'
import { FORMS } from '../../services/formStorageService'
import { NewGoal } from '../../@types/NewGoalType'

export default class EditGoalController {
  constructor(
    private readonly referentialDataService: ReferentialDataService,
    private readonly noteService: NoteService,
    private readonly goalService: GoalService,
  ) {}

  private render = async (req: Request, res: Response, next: NextFunction) => {
    const { uuid } = req.params
    const { errors } = req
    const errorKeys: string[] = []
    let form = {}
    const goal = await this.goalService.getGoal(uuid)
    const dateOptionsDate = getAchieveDateOptions(new Date())
    dateOptionsDate.push(new Date(new Date().setDate(new Date().getDate() + 7)))
    if (errors) {
      Object.keys(errors.body).forEach(key =>
        key === 'goal-input-autocomplete' ? errorKeys.push('goal-name') : errorKeys.push(key),
      )
      form = req.body
    } else {
      const targetDate = goal.targetDate?.substring(0, 10)
      const customDate = dateOptionsDate.filter(date => date.toISOString().substring(0, 10) === targetDate).length === 0
      form = {
        'goal-input-autocomplete': goal.title,
        'other-area-of-need-radio': goal.relatedAreasOfNeed.length === 0 ? 'no' : 'yes',
        'start-working-goal-radio': goal.targetDate ? 'yes' : 'no',
        'date-selection-radio': customDate ? 'custom' : targetDate,
        'date-selection-custom': customDate ? targetDate : undefined,
      }
    }

    const areaOfNeed = goal.areaOfNeed.name
    const today = formatDateWithStyle(new Date().toISOString(), 'short')
    const allAreaOfNeed = this.referentialDataService.getAreasOfNeed()
    const arnUrl = allAreaOfNeed.filter(arn => arn.name === areaOfNeed)[0].url
    const relatedAreaOfNeed = goal.relatedAreasOfNeed.map(raon => raon.name)
    const selectedOtherAreaOfNeed: string[] = req.body['other-area-of-need'] || relatedAreaOfNeed
    const otherAreaOfNeed = allAreaOfNeed
      .filter(aon => aon.name !== areaOfNeed)
      .map(({ name }) => ({ text: name, value: name, checked: selectedOtherAreaOfNeed.includes(name) }))
    const popData = req.services.sessionService.getSubjectDetails()
    return res.render('pages/edit-goal', {
      locale: locale.en,
      data: {
        today,
        otherAreaOfNeed,
        areaOfNeed,
        popData,
        dateOptionsDate,
        arnUrl,
        form,
      },
      errors,
      errorKeys,
    })
  }

  public get = this.render

  post = (req: Request, res: Response, next: NextFunction) => {
    if (Object.keys(req.errors.body).length) {
      return this.render(req, res, next)
    }
    return this.saveAndRedirect(req, res, next)
  }

  private saveAndRedirect = async (req: Request, res: Response, next: NextFunction) => {
    req.services.formStorageService.saveFormData(FORMS.CREATE_GOAL, {
      processed: this.processGoalData(req.body),
      raw: req.body,
    })
    const type = req.query?.type
    const processedData: NewGoal = this.processGoalData(req.body)
    const planUuid = req.services.sessionService.getPlanUUID()
    const { uuid } = await this.goalService.updateGoal(processedData, planUuid)
    req.services.formStorageService.saveFormData('currentGoal', {
      processed: null,
      raw: { uuid },
    })
    const redirectUrl: string = `${URLs.PLAN_SUMMARY}?status=updated&type=${type}`
    return res.redirect(redirectUrl)
  }

  private processGoalData(body: any) {
    const title = body['goal-input-autocomplete']
    const targetDate =
      // eslint-disable-next-line no-nested-ternary
      body['start-working-goal-radio'] === 'yes'
        ? body['date-selection-radio'] === 'custom'
          ? dateToISOFormat(body['date-selection-custom'])
          : body['date-selection-radio']
        : null
    const areaOfNeed = body['area-of-need']
    const relatedAreasOfNeed = body['other-area-of-need-radio'] === 'yes' ? body['other-area-of-need'] : undefined

    return {
      title,
      areaOfNeed,
      targetDate,
      relatedAreasOfNeed,
    }
  }
}
