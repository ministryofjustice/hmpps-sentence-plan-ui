import { NextFunction, Request, Response } from 'express'
import locale from './locale.json'
import URLs from '../URLs'

export default class AgreePlanController {
  private render = async (req: Request, res: Response, next: NextFunction) => {
    const { errors } = req

    try {
      const planUuid = req.services.sessionService.getPlanUUID()
      const popData = req.services.sessionService.getSubjectDetails()
      const type = req.query?.type
      return res.render('pages/agree-plan', {
        locale: locale.en,
        data: {
          planUuid,
          popData,
          type,
        },
        errors,
      })
    } catch (e) {
      return next(e)
    }
  }

  private saveAndRedirect = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // const planUuid = req.services.sessionService.getPlanUUID()
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
