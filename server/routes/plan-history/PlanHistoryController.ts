import { NextFunction, Request, Response } from 'express'
import locale from './locale.json'
import { AccessMode } from '../../@types/Handover'
import { HttpError } from '../../utils/HttpError'

export default class PlanHistoryController {
  private render = async (req: Request, res: Response, next: NextFunction) => {
    const { errors } = req

    try {
      const planUuid = req.services.sessionService.getPlanUUID()
      const oasysReturnUrl = req.services.sessionService.getOasysReturnUrl()
      const notes = await req.services.planService.getNotes(planUuid)
      const readWrite = req.services.sessionService.getAccessMode() === AccessMode.READ_WRITE

      if (notes.length === 0) {
        return next(HttpError(403, 'Plan has not been agreed'))
      }

      const pageId = 'plan-history'

      return res.render('pages/plan-history', {
        locale: locale.en,
        data: {
          notes,
          oasysReturnUrl,
          pageId,
          readWrite,
        },
        errors,
      })
    } catch (e) {
      return next(HttpError(500, e.message))
    }
  }

  get = this.render
}
