import { NextFunction, Request, Response } from 'express'
import planOverviewLocale from '../planOverview/locale.json'
import locale from './locale.json'
import { requireAccessMode } from '../../middleware/authorisationMiddleware'
import { HttpError } from '../../utils/HttpError'
import { PlanType } from '../../@types/PlanType'
import { AuditEvent } from '../../services/auditService'
import { AccessMode } from '../../@types/SessionType'

export default class ViewPreviousVersionController {
  planVersion: PlanType

  private render = async (req: Request, res: Response, next: NextFunction) => {
    const { errors } = req
    const { planVersionUuid } = req.params

    try {
      this.planVersion = await req.services.planService.getPlanVersionByVersionUuid(planVersionUuid)

      await req.services.auditService.send(AuditEvent.VIEW_PREVIOUS_VERSION)

      const readWrite = req.services.sessionService.getAccessMode() === AccessMode.READ_WRITE
      const viewPreviousVersionMode: boolean = true
      const type = req.query?.type ?? 'current'
      const status = req.query?.status
      const planVersionBaseUrl = `/view-historic/${planVersionUuid}`

      // was the plan updated more than 10s after the user agreed to it?
      let isUpdatedAfterAgreement = false
      if (this.planVersion.agreementDate !== null) {
        const updatedDate = new Date(this.planVersion.updatedDate)
        const agreementDate = new Date(this.planVersion.agreementDate)
        isUpdatedAfterAgreement = Math.abs((updatedDate.getTime() - agreementDate.getTime()) / 1000) > 10
      }

      return res.render('pages/plan', {
        locale: { ...planOverviewLocale.en, ...locale.en },
        data: {
          planAgreementStatus: this.planVersion.agreementStatus, // required by layout.njk
          plan: this.planVersion,
          isUpdatedAfterAgreement,
          type,
          status,
          readWrite,
          viewPreviousVersionMode,
          planVersionBaseUrl,
        },
        errors,
      })
    } catch (e) {
      return next(HttpError(500, e.message))
    }
  }

  get = [requireAccessMode(AccessMode.READ_ONLY), this.render]
}
