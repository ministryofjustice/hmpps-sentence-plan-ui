import { RequestHandler } from 'express'
import createError from 'http-errors'
import { AccessMode } from '../@types/Handover'

export default function authorisationMiddleware(): RequestHandler {
  return (req, res, next) => {
    if (req.services.sessionService.getPrincipalDetails()) {
      return next()
    }

    req.session.returnTo = req.originalUrl
    return res.redirect('/sign-in')
  }
}

export function requireAccessMode(requiredAccessMode: AccessMode): RequestHandler {
  return (req, res, next) => {
    try {
      const currentAccessMode = req.services.sessionService.getAccessMode()

      if (requiredAccessMode === AccessMode.READ_WRITE && currentAccessMode === AccessMode.READ_ONLY) {
        return next(createError(403))
      }

      return next()
    } catch (error) {
      return next(error)
    }
  }
}
