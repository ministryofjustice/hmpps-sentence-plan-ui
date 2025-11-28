import { NextFunction, Request, Response } from 'express'
import { HttpError } from '../../utils/HttpError'
import locale from './locale.json'
import { AuditEvent } from '../../services/auditService'

export default class PreviousVersionsController {
  constructor() {}

  get = async (req: Request, res: Response, next: NextFunction) => {
    const { errors } = req
    try {
      const planUuid = req.services.sessionService.getPlanUUID()
      const pageId = 'previous-versions'
      const plan = await req.services.planService.getPlanByUuid(planUuid)
      const authType = req.services.sessionService.getPrincipalDetails()?.authType
      const versions = await req.services.coordinatorService.getVersionsByUuid(planUuid, authType)

      // remove the latest(current) version from allVersions:
      const trimmedAllVersions = Object.fromEntries(
        Object.entries(versions.allVersions)
          .sort((a, b) => b[0].localeCompare(a[0]))
          .slice(1),
      )

      await req.services.auditService.send(AuditEvent.VIEW_PREVIOUS_VERSIONS_PAGE)

      return res.render('pages/previous-versions', {
        locale: locale.en,
        data: {
          planAgreementStatus: plan.agreementStatus,
          pageId,
          oasysReturnUrl: req.services.sessionService.getSystemReturnUrl(),
          versions: {
            ...versions,
            allVersions: trimmedAllVersions,
          },
          returnLink: req.services.sessionService.getReturnLink(),
        },
        errors,
      })
    } catch (error) {
      return next(HttpError(500, error.message))
    }
  }
}
