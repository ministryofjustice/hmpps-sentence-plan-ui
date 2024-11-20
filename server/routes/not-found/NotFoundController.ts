import { NextFunction, Request, Response } from 'express'
import { constants as http } from 'http2'
import locale from './locale.json'

export default class NotFoundController {
  private render = async (req: Request, res: Response, next: NextFunction) => {
    return res.status(http.HTTP_STATUS_NOT_FOUND).render('pages/not-found', {
      locale: locale.en,
    })
  }

  any = this.render
}
