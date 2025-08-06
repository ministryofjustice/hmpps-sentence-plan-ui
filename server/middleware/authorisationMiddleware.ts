import { RequestHandler } from 'express'
import { AccessMode } from '../@types/Handover'
import { HttpError } from '../utils/HttpError'

export default function authorisationMiddleware(): RequestHandler {
  return (req, res, next) => {
    if (req.services.sessionService.getPrincipalDetails()) {
      return next()
    }

    // TODO: error flow? redirect to handover or auth depending on method used?
    req.session.returnTo = req.originalUrl
    return res.redirect('/sign-in/hmpps-auth')
  }
}

export function requireAccessMode(requiredAccessMode: AccessMode): RequestHandler {
  return (req, res, next) => {
    const currentAccessMode = req.services.sessionService.getAccessMode()

    if (requiredAccessMode === AccessMode.READ_WRITE && currentAccessMode === AccessMode.READ_ONLY) {
      return next(HttpError(403, 'User is READ_ONLY'))
    }

    return next()
  }
}
