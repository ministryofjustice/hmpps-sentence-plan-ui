import { NextFunction, Request, Response } from 'express'
import locale from './locale.json'
import InfoService from '../../services/sentence-plan/infoService'
import { FORMS } from '../../services/formStorageService'
import GoalService from '../../services/sentence-plan/goalService'
import StepService from '../../services/sentence-plan/stepsService'
import { NewGoal } from '../../@types/NewGoalType'
import { NewStep } from '../../@types/NewStepType'
import URLs from '../URLs'

export default class ConfirmGoalController {
  constructor(
    private readonly infoService: InfoService,
    private readonly goalService: GoalService,
    private readonly stepService: StepService,
  ) {}

  render = async (req: Request, res: Response, next: NextFunction) => {
    const crn = 'ABC123XYZ' // TODO: This is likely to be a session value, get from there
    const { errors } = req

    try {
      const popData = await this.infoService.getPopData(crn)
      const goalData = req.services.formStorageService.getFormData(FORMS.CREATE_GOAL)
      const stepData = req.services.formStorageService.getFormData(FORMS.CREATE_STEPS)

      return res.render('pages/confirm-goal', {
        locale: locale.en,
        data: {
          popData,
          goalData,
          stepData,
          form: req.body,
        },
        errors,
      })
    } catch (e) {
      return next(e)
    }
  }

  saveAndRedirect = async (req: Request, res: Response, next: NextFunction) => {
    const goalData: NewGoal = {
      ...req.services.formStorageService.getFormData<NewGoal>(FORMS.CREATE_GOAL).processed,
      agreementNote: req.body['goal-agreement-note'],
      isAgreed: req.body['goal-agreement'],
    }
    const stepsData = req.services.formStorageService.getFormData<NewStep[]>(FORMS.CREATE_STEPS).processed

    if (goalData.isAgreed) {
      try {
        const responseGoalData = await this.goalService.saveGoal(goalData)
        await this.stepService.saveSteps(stepsData, responseGoalData.uuid)

        req.services.formStorageService.clearFormData(FORMS.CREATE_GOAL)
        req.services.formStorageService.clearFormData(FORMS.CREATE_STEPS)

        return res.redirect('/') // TODO: Redirect to the plan?
      } catch (e) {
        return next(e)
      }
    }

    // TODO: Handle if PoP disagrees
    return next()
  }

  get = (req: Request, res: Response, next: NextFunction) => {
    if (!req.services.formStorageService.hasFormData(FORMS.CREATE_GOAL)) {
      return res.redirect(URLs.ABOUT_POP)
    }

    return this.render(req, res, next)
  }

  post = (req: Request, res: Response, next: NextFunction) => {
    if (!req.services.formStorageService.hasFormData(FORMS.CREATE_GOAL)) {
      return res.redirect(URLs.ABOUT_POP)
    }

    if (Object.keys(req.errors.body).length) {
      return this.render(req, res, next)
    }

    return this.saveAndRedirect(req, res, next)
  }
}
