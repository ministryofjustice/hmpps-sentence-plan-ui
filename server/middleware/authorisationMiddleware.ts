import { RequestHandler } from 'express'
import {AccessMode, AuthType} from '../@types/Handover'
import { HttpError } from '../utils/HttpError'
import {JwtPayloadExtended} from "../@types/Token";
import {jwtDecode} from "jwt-decode";

export default function authorisationMiddleware(): RequestHandler {
  return (req, res, next) => {
    const authType: AuthType = req.services.sessionService.getPrincipalDetails()?.authType

    // Auth
    if (authType == AuthType.HMPPS_AUTH) {
      const {authorities: roles = []}: JwtPayloadExtended = jwtDecode(req?.user?.token)

      if (roles.includes('ROLE_SENTENCE_PLAN_USER')) {
        return next()
      } else {
        return res.redirect('/autherror')
      }
    }

    // Handover
    if (req.services.sessionService.getPrincipalDetails()) {
      return next()
    }

    // Failure
    req.session.returnTo = req.originalUrl
    return res.redirect('/sign-in/handover')
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
