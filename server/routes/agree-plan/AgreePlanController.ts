import { NextFunction, Request, Response } from 'express'
import locale from './locale.json'
import URLs from '../URLs'
import PlanService from '../../services/sentence-plan/planService'

export default class AgreePlanController {
  constructor(private readonly planService: PlanService) {}

  private render = async (req: Request, res: Response, next: NextFunction) => {
    const { errors } = req

    try {
      const planUuid = req.services.sessionService.getPlanUUID()
      const popData = req.services.sessionService.getSubjectDetails()
      return res.render('pages/agree-plan', {
        locale: locale.en,
        data: {
          planUuid,
          popData,
        },
        errors,
      })
    } catch (e) {
      return next(e)
    }
  }

  private saveAndRedirect = async (req: Request, res: Response, next: NextFunction) => {
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
    if (Object.keys(req.errors?.body).length) {
      return this.render(req, res, next)
    }
    return this.saveAndRedirect(req, res, next)
  }
}
