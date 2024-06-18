import { NextFunction, Request, Response } from 'express'
import ReferentialDataService from '../../services/sentence-plan/referentialDataService'
import locale from './locale.json'
import InfoService from '../../services/sentence-plan/infoService'
import NoteService from '../../services/sentence-plan/noteService'
import URLs from '../URLs'
import { FORMS } from '../../services/formStorageService'

export default class CreateGoalController {
  constructor(
    private readonly referentialDataService: ReferentialDataService,
    private readonly infoService: InfoService,
    private readonly noteService: NoteService,
  ) {}

  private saveAndRedirect = async (req: Request, res: Response, next: NextFunction) => {
    req.services.formStorageService.saveFormData(FORMS.CREATE_GOAL, {
      processed: this.processGoalData(req.body),
      raw: req.body,
    })

    // TODO: Step data hasn't been decided in the design yet, so just mock some
    req.services.formStorageService.saveFormData(FORMS.CREATE_STEPS, {
      processed: [
        {
          description: 'Make a referral to housing officer',
          actor: 'Probation practitioner',
          status: 'PENDING',
        },
        {
          description: 'Provide any information that is required',
          actor: 'Joan',
          status: 'PENDING',
        },
      ],
      raw: req.body,
    })

    return res.redirect(URLs.CREATE_STEP)
  }

  private render = async (req: Request, res: Response, next: NextFunction) => {
    const crn = 'ABC123XYZ' // TODO: This is likely to be a session value, get from there
    const { areaOfNeed } = req.params
    const { errors } = req

    try {
      const dateOptionsDate = this.getAchieveDateOptions(new Date())
      const [popData, referenceData, noteData] = await Promise.all([
        this.infoService.getPopData(crn),
        this.referentialDataService.getQuestionDataByAreaOfNeed(areaOfNeed),
        this.noteService.getNoteDataByAreaOfNeed(areaOfNeed, crn),
      ])
      return res.render('pages/create-goal', {
        locale: locale.en,
        data: {
          popData,
          referenceData,
          noteData,
          dateOptionsDate,
          form: req.body,
        },
        errors,
      })
    } catch (e) {
      return next(e)
    }
  }

  private processGoalData(body: any) {
    const title =
      body['goal-selection-radio'] === 'custom' ? body['goal-selection-custom'] : body['goal-selection-radio']
    const targetDate =
      body['date-selection-radio'] === 'custom' ? body['date-selection-custom'] : body['date-selection-radio']
    const areaOfNeed = body['area-of-need']

    return {
      title,
      areaOfNeed,
      targetDate,
    }
  }

  private getAchieveDateOptions = (date: Date, dateOptionsInMonths = [3, 6, 12]) => {
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
