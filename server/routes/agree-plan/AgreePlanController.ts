import { NextFunction, Request, Response } from 'express'
import { plainToInstance } from 'class-transformer'
import locale from './locale.json'
import URLs from '../URLs'
import PlanService from '../../services/sentence-plan/planService'
import validateRequest, { getValidationErrors } from '../../middleware/validationMiddleware'
import Plan from '../shared-models/plan.model'
import transformRequest from '../../middleware/transformMiddleware'
import AgreePlanPost from './models/AgreePlanPost.model'

export default class AgreePlanController {
  constructor(private readonly planService: PlanService) {}

  private render = async (req: Request, res: Response, next: NextFunction) => {
    const { errors } = req

    const planUuid = req.services.sessionService.getPlanUUID()
    const popData = req.services.sessionService.getSubjectDetails()

    return res.render('pages/agree-plan', {
      locale: locale.en,
      data: {
        planUuid,
        popData,
        form: req.body,
      },
      errors,
    })
  }

  private agreePlanAndRedirect = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const planUuid = req.services.sessionService.getPlanUUID()
      this.planService.getPlanByUuid(planUuid) // TODO this is where the planService.agreePlan call should go once the body is confirmed
      return res.redirect(`${URLs.PLAN_SUMMARY}`)
    } catch (e) {
      return next(e)
    }
  }

  private validatePlanForAgreement = async (req, res, next) => {
    try {
      req.errors = req.errors ?? {}

      const planUuid = req.services.sessionService.getPlanUUID()
      const plan = await this.planService.getPlanByUuid(planUuid)

      req.errors.domain = getValidationErrors(plainToInstance(Plan, plan))

      return next()
    } catch (e) {
      return next(e)
    }
  }

  private handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const hasErrors = Object.values(req.errors).some(errorCategory => Object.keys(errorCategory).length > 0)

    if (hasErrors) {
      if (req.method === 'POST') {
        return this.render(req, res, next)
      }

      return res.redirect(URLs.PLAN_SUMMARY)
    }

    return next()
  }

  get = [this.validatePlanForAgreement, this.handleValidationErrors, this.render]

  post = [
    transformRequest({
      body: AgreePlanPost,
    }),
    validateRequest(),
    this.validatePlanForAgreement,
    this.handleValidationErrors,
    this.agreePlanAndRedirect,
  ]
}
