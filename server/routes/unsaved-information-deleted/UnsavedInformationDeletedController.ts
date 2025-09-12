import { NextFunction, Request, Response } from 'express'
import locale from './locale.json'

export default class UnsavedInformationDeletedController {
  private readonly render = async (req: Request, res: Response, next: NextFunction) => {
    return res.render('pages/unsaved-information-deleted', {
      locale: locale.en,
    })
  }

  get = [this.render]
}
