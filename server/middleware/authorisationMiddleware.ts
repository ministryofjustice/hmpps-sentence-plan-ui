import type { RequestHandler } from 'express'
import { AccessMode } from '../@types/Handover'
import URLs from '../routes/URLs'

export default function authorisationMiddleware(): RequestHandler {
  return (req, res, next) => {
    if (req.services.sessionService.getPrincipalDetails()) {
      if (
        req.services.sessionService.getPrincipalDetails().accessMode === AccessMode.READ_ONLY &&
        req.originalUrl?.split('?')[0] !== URLs.PLAN_OVERVIEW
      ) {
        req.session.returnTo = req.originalUrl
        return res.redirect('/sign-in')
      }
      return next()
    }

    req.session.returnTo = req.originalUrl
    return res.redirect('/sign-in')
  }
}
