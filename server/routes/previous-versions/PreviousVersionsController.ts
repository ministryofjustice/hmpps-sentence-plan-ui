import { NextFunction, Request, Response } from 'express'
import { HttpError } from '../../utils/HttpError'
import locale from './locale.json'

export default class PreviousVersionsController {
  constructor() {}

  get = async (req: Request, res: Response, next: NextFunction) => {
    const { errors } = req
    try {
      const planUuid = req.services.sessionService.getPlanUUID()
      const versions = await req.services.assessmentService.getVersionsByUuid(planUuid)
      const pageId = 'previous-versions'

      return res.render('pages/previous-versions', {
        locale: locale.en,
        data: {
          pageId,
          oasysReturnUrl: req.services.sessionService.getOasysReturnUrl(),
          versions,
          returnLink: req.services.sessionService.getReturnLink(),
        },
        errors,
      })
    } catch (error) {
      return next(HttpError(500, error.message))
    }
  }
}
