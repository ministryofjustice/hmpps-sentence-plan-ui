import { NextFunction, Request, Response } from 'express'
import 'reflect-metadata'
import URLs from '../routes/URLs'
import { AccessMode } from '../@types/SessionType'

export default function checkPrivacyScreenAgreed() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.session.hasAgreedPrivacyPolicy || req.services.sessionService.getAccessMode() === AccessMode.READ_ONLY) {
      return next()
    }
    return res.redirect(URLs.DATA_PRIVACY)
  }
}
