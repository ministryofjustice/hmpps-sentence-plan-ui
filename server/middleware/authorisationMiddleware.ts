import { RequestHandler } from 'express'
import { jwtDecode } from 'jwt-decode'
import { HttpError } from '../utils/HttpError'
import { JwtPayloadExtended } from '../@types/Token'
import { AccessMode, AuthType } from '../@types/SessionType'

export default function authorisationMiddleware(): RequestHandler {
  return async (req, res, next) => {
    const principalDetails = req.services.sessionService.getPrincipalDetails()

    if (!principalDetails) {
      req.session.returnTo = req.originalUrl
      return res.redirect('/sign-in/hmpps-auth')
    }

    // Auth
    if (principalDetails.authType === AuthType.HMPPS_AUTH) {
      const { authorities: roles = [], user_name: userName }: JwtPayloadExtended = jwtDecode(req?.user?.token)
      const { crn } = req.services.sessionService.getSubjectDetails()

      if (roles.includes('ROLE_SENTENCE_PLAN')) {
        try {
          const data = await req.services.sentencePlanAndDeliusService.getDataByUsernameAndCrn(userName, crn)

          if (data.canAccess) {
            return next()
          }

          return next(HttpError(403, `Case with CRN ${crn} is not accessible for user ${userName}.`))
        } catch (e) {
          return next(HttpError(500, e.message))
        }
      }

      return next(HttpError(403, 'No role ROLE_SENTENCE_PLAN found for this user.'))
    }

    // Handover
    return next()
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
