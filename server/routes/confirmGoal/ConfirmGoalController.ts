import { NextFunction, Request, Response } from 'express'
import locale from './locale.json'
import InfoService from '../../services/sentence-plan/infoService'
import FormHandlerService, { FORMS } from '../../services/formHandlerService'
import GoalService from '../../services/sentence-plan/goalService'
import StepService from '../../services/sentence-plan/stepsService'
import { NewGoal } from '../../interfaces/NewGoalType'
import { NewStep } from '../../interfaces/NewStepType'

export default class ConfirmGoalController {
  constructor(
    private readonly infoService: InfoService,
    private readonly goalService: GoalService,
    private readonly stepService: StepService,
  ) {}

  get = async (req: Request, res: Response, next: NextFunction) => {
    const formHandlerService = new FormHandlerService(req)

    const crn = 'ABC123XYZ' // TODO: This is likely to be a session value, get from there

    try {
      const popData = await this.infoService.getPopData(crn)
      const goalData = formHandlerService.getFormData(FORMS.CREATE_GOAL)
      const stepData = formHandlerService.getFormData(FORMS.CREATE_STEPS)

      return res.render('pages/confirm-goal', {
        locale: locale.en,
        data: {
          popData,
          goalData,
          stepData,
        },
      })
    } catch (e) {
      return next(e)
    }
  }

  post = async (req: Request, res: Response, next: NextFunction) => {
    const formHandlerService = new FormHandlerService(req)

    // TODO: Do sanitization/error handling for POST data
    const goalData: NewGoal = {
      ...formHandlerService.getFormData<NewGoal>(FORMS.CREATE_GOAL).processed,
      agreementNote: '',
      isAgreed: req.body['goal-agreement'],
    }
    const stepsData = formHandlerService.getFormData<NewStep[]>(FORMS.CREATE_STEPS).processed

    if (goalData.isAgreed) {
      try {
        const responseGoalData = await this.goalService.saveGoal(goalData)
        await this.stepService.saveSteps(stepsData, responseGoalData.uuid)

        formHandlerService.clearFormData(FORMS.CREATE_GOAL)
        formHandlerService.clearFormData(FORMS.CREATE_STEPS)

        return res.redirect('/') // TODO: Redirect to the plan?
      } catch (e) {
        return next(e)
      }
    }

    // TODO: Handle if PoP disagrees
    return next()
  }
}
