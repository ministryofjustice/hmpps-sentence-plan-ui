import { NextFunction, Request, Response } from 'express'
import locale from './locale.json'

export default class PlanHistoryController {
  private render = async (req: Request, res: Response, next: NextFunction) => {
    const { errors } = req

    try {
      const planUuid = req.services.sessionService.getPlanUUID()
      const plan = await req.services.planService.getPlanByUuid(planUuid)

      return res.render('pages/plan-history', {
        locale: locale.en,
        data: {
          plan,
        },
        errors,
      })
    } catch (e) {
      return next(e)
    }
  }

  get = this.render
}
