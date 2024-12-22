import { NextFunction, Request, Response } from 'express'
import { plainToInstance } from 'class-transformer'
import locale from './locale.json'
import URLs from '../URLs'
import validateRequest, { getValidationErrors } from '../../middleware/validationMiddleware'
import PlanModel from '../shared-models/PlanModel'
import transformRequest from '../../middleware/transformMiddleware'
import AgreePlanPostModel from './models/AgreePlanPostModel'
import { PlanAgreementStatus } from '../../@types/PlanType'
import { PlanAgreement } from '../../@types/PlanAgreement'
import { requireAccessMode } from '../../middleware/authorisationMiddleware'
import { AccessMode } from '../../@types/Handover'
import { HttpError } from '../../utils/HttpError'

export default class AgreePlanController {
  private render = async (req: Request, res: Response) => {
    const { errors } = req

    const returnLink = req.services.sessionService.getReturnLink()

    return res.render('pages/agree-plan', {
      locale: locale.en,
      data: {
        returnLink,
        form: req.body,
      },
      errors,
    })
  }

  private agreePlanAndRedirect = async (req: Request, res: Response, next: NextFunction) => {
    const principalDetails = req.services.sessionService.getPrincipalDetails()
    const subjectDetails = req.services.sessionService.getSubjectDetails()

    const agreement: Partial<PlanAgreement> = {
      practitionerName: principalDetails.displayName,
      personName: `${subjectDetails.givenName} ${subjectDetails.familyName}`,
      optionalNote: (req.body as AgreePlanPostModel).notes,
      agreementStatusNote: '',
    }

    switch (req.body['agree-plan-radio']) {
      case 'yes':
        agreement.agreementStatus = PlanAgreementStatus.AGREED
        break
      case 'no':
        agreement.agreementStatus = PlanAgreementStatus.DO_NOT_AGREE
        agreement.agreementStatusNote = req.body['does-not-agree-details']
        break
      case 'couldNotAnswer':
      default:
        agreement.agreementStatus = PlanAgreementStatus.COULD_NOT_ANSWER
        agreement.agreementStatusNote = req.body['could-not-answer-details']
    }

    try {
      const planUuid = req.services.sessionService.getPlanUUID()
      await req.services.planService.agreePlan(planUuid, agreement as PlanAgreement)

      return res.redirect(`${URLs.PLAN_OVERVIEW}`)
    } catch (e) {
      return next(e)
    }
  }

  private validatePlanForAgreement = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const planUuid = req.services.sessionService.getPlanUUID()
      const plan = await req.services.planService.getPlanByUuid(planUuid)
      const domainErrors = getValidationErrors(plainToInstance(PlanModel, plan)) ?? {}

      if (plan.agreementStatus !== PlanAgreementStatus.DRAFT) {
        domainErrors.plan = {
          alreadyAgreed: true,
        }
      }

      if (Object.keys(domainErrors).length) {
        req.errors = { ...req.errors, domain: domainErrors }
      }

      return next()
    } catch (e) {
      return next(HttpError(500, e.message))
    }
  }

  private handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const hasErrors = Object.values(req.errors ?? {}).some(errorCategory => Object.keys(errorCategory).length > 0)

    if (hasErrors) {
      if (req.method === 'POST') {
        return this.render(req, res)
      }

      return res.redirect(URLs.PLAN_OVERVIEW)
    }

    return next()
  }

  get = [
    requireAccessMode(AccessMode.READ_WRITE),
    this.validatePlanForAgreement,
    this.handleValidationErrors,
    this.render,
  ]

  post = [
    requireAccessMode(AccessMode.READ_WRITE),
    transformRequest({
      body: AgreePlanPostModel,
    }),
    validateRequest(),
    this.validatePlanForAgreement,
    this.handleValidationErrors,
    this.agreePlanAndRedirect,
  ]
}
