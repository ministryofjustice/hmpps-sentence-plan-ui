import { RequestHandler } from 'express'
import { AccessMode } from '../@types/Handover'
import createError,  from "http-errors";

export default function authorisationMiddleware(): RequestHandler {
  return (req, res, next) => {
    if (req.services.sessionService.getPrincipalDetails()) {
      return next()
    }

    req.session.returnTo = req.originalUrl
    return res.redirect('/sign-in')
  }
}

export function hasAccessMode(requiredAccessMode: AccessMode): RequestHandler {
  return (req, res, next) => {
    try {
      const currentAccessMode = req.services.sessionService.getAccessMode();

      if (requiredAccessMode === AccessMode.READ_WRITE && currentAccessMode === AccessMode.READ_ONLY) {
        return next(createError(403))
      }

      next();
    } catch (error) {
      return next(error)
    }
  };
}
