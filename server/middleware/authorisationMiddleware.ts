import { RequestHandler } from 'express'
import { AccessMode } from '../@types/Handover'
import { HttpError } from '../utils/HttpError'
import {JwtPayloadExtended} from "../@types/Token";
import {jwtDecode} from "jwt-decode";

export default function authorisationMiddleware(): RequestHandler {
  return (req, res, next) => {
    const { auth_source, authorities: roles = [] }: JwtPayloadExtended = jwtDecode(req?.user?.token)

    if (auth_source === 'auth') {
       if (roles.includes('ROLE_SENTENCE_PLAN_USER')) {
         return next()
       } else {
         return res.redirect('/autherror')
       }
    } else if (auth_source !== 'auth' && req.services.sessionService.getPrincipalDetails()) {
      return next()
    }

    req.session.returnTo = req.originalUrl
    if (auth_source === 'auth') {
      return res.redirect('/sign-in/hmpps-auth')
    } else {
      return res.redirect('/sign-in/handover')
    }
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
