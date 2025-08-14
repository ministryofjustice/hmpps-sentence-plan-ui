import { RequestHandler } from 'express'
import {AccessMode, AuthType} from '../@types/Handover'
import { HttpError } from '../utils/HttpError'
import {JwtPayloadExtended} from "../@types/Token";
import {jwtDecode} from "jwt-decode";

export default function authorisationMiddleware(): RequestHandler {
  return (req, res, next) => {
    // Auth
    if (req.services.sessionService.getPrincipalDetails()?.authType == AuthType.HMPPS_AUTH) {
      const {authorities: roles = []}: JwtPayloadExtended = jwtDecode(req?.user?.token)

      if (roles.includes('ROLE_SENTENCE_PLAN_USER')) {
        return next()
      } else {
        throw new HttpError(401)
      }
    }

    // Handover
    if (req.services.sessionService.getPrincipalDetails()) {
      return next()
    }

    // Failure
    req.session.returnTo = req.originalUrl
    return res.redirect('/sign-in/hmpps-auth') // This is what happens if you access with no creds...
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
