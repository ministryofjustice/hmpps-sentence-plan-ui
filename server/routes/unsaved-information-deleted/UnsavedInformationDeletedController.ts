import { NextFunction, Request, Response } from 'express'
import locale from './locale.json'
import { HttpError } from '../../utils/HttpError'

export default class UnsavedInformationDeletedController {
  private render = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const subjectData = await req.services.sessionService.getSubjectDetails()

      return res.render('pages/unsaved-information-deleted', {
        locale: locale.en,
        data: {
          subjectData,
        },
      })
    } catch (e) {
      return next(HttpError(500, e.message))
    }
  }

  get = [this.render]
}
