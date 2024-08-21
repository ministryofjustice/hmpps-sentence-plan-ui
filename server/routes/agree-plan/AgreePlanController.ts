import { NextFunction, Request, Response } from 'express'
import locale from './locale.json'
import URLs from '../URLs'
import PlanService from '../../services/sentence-plan/planService'
import validateRequest, { getValidationErrors } from '../../middleware/validationMiddleware'

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
      this.planService.getPlanByUuid(planUuid)
      return res.redirect(`${URLs.PLAN_SUMMARY}`)
    } catch (e) {
      return next(e)
    }
  }

  get = this.render

  post = (req: Request, res: Response, next: NextFunction) => {
    if (Object.keys(req.errors.body).length) {
      return this.render(req, res, next)
    }

    if (req.body.action === 'view') {
      return res.redirect(URLs.CREATE_STEP)
    }

    if (req.body.action === 'agree') {
      return this.agreePlanAndRedirect(req, res, next)
    }

    return res.redirect(URLs.PLAN_SUMMARY)
  }
}
