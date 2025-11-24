import { NextFunction, Request, Response } from 'express'
import 'reflect-metadata'
import URLs from '../routes/URLs'

export default function checkPrivacyScreenAgreed() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.session.hasAgreedPrivacyPolicy) {
      return next()
    }
    return res.redirect(URLs.DATA_PRIVACY)
  }
}
