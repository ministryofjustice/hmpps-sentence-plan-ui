import { NextFunction, Request, Response } from 'express'
import ReferentialDataService from '../../services/sentence-plan/referentialDataService'
import locale from './locale.json'
import InfoService from '../../services/sentence-plan/infoService'
import NoteService from '../../services/sentence-plan/noteService'
import URLs from '../URLs'
import FormHandlerService, { FORMS } from '../../services/formHandlerService'

export default class CreateGoalController {
  constructor(
    private readonly referentialDataService: ReferentialDataService,
    private readonly infoService: InfoService,
    private readonly noteService: NoteService,
  ) {}

  private saveAndRedirect = async (req: Request, res: Response, next: NextFunction) => {
    if (req.errors.body) {
      return this.render(req, res, next)
    }

    const formHandlerService = new FormHandlerService(req)
    formHandlerService.saveFormData(FORMS.CREATE_GOAL, {
      processed: this.processGoalData(req.body),
      raw: req.body,
    })

    // TODO: Step data hasn't been decided in the design yet, so just mock some
    formHandlerService.saveFormData(FORMS.CREATE_STEPS, {
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

    return res.redirect(URLs.CONFIRM_GOAL)
  }

  private render = async (req: Request, res: Response, next: NextFunction) => {
    const crn = 'ABC123XYZ' // TODO: This is likely to be a session value, get from there
    const { areaOfNeed } = req.params
    const { errors } = req

    try {
      const popData = await this.infoService.getPopData(crn)
      const referenceData = await this.referentialDataService.getQuestionDataByAreaOfNeed(areaOfNeed)
      const noteData = await this.noteService.getNoteDataByAreaOfNeed(areaOfNeed, crn)
      const dateOptionsDate = this.getAchieveDateOptions(new Date())

      return res.render('pages/create-goal', {
        locale: locale.en,
        data: {
          popData,
          referenceData,
          noteData,
          dateOptionsDate,
        },
        errors,
      })
    } catch (e) {
      return next(e)
    }
  }

  private processGoalData(rawGoalData: any) {
    let title
    let targetDate

    if (rawGoalData['goal-selection-radio'] === 'custom') {
      title = rawGoalData['goal-selection-custom']
    } else {
      title = rawGoalData['goal-selection-radio']
    }

    if (rawGoalData['date-selection-radio'] === 'custom') {
      const dateString = `${rawGoalData['date-selection-custom-year']}-${rawGoalData['date-selection-custom-month']}-${rawGoalData['date-selection-custom-day']}`
      targetDate = new Date(dateString)
    } else {
      targetDate = new Date(rawGoalData['date-selection-radio'])
    }

    const areaOfNeed = rawGoalData['area-of-need']

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

  public post = this.saveAndRedirect
}
