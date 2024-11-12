import { NextFunction, Request, Response } from 'express'
import locale from './locale.json'

export default class PlanHistoryController {
  private render = async (req: Request, res: Response, next: NextFunction) => {
    const { errors } = req

    try {
      const planUuid = req.services.sessionService.getPlanUUID()
      const oasysReturnUrl = req.services.sessionService.getOasysReturnUrl()
      const notes = await req.services.planService.getNotes(planUuid)

      return res.render('pages/plan-history', {
        locale: locale.en,
        data: {
          notes,
          oasysReturnUrl,
        },
        errors,
      })
    } catch (e) {
      return next(e)
    }
  }

  get = this.render
}
