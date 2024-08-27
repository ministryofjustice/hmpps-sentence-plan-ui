import { NextFunction, Request, Response } from 'express'
import { plainToInstance } from 'class-transformer'
import locale from './locale.json'
import URLs from '../URLs'
import PlanService from '../../services/sentence-plan/planService'
import validateRequest, { getValidationErrors } from '../../middleware/validationMiddleware'
import Plan from '../shared-models/plan.model'
import transformRequest from '../../middleware/transformMiddleware'
import AgreePlanPost from './models/AgreePlanPost.model'
import { PlanAgreementStatus } from '../../@types/PlanType'
import { PlanAgreement } from '../../@types/PlanAgreement'

export default class AgreePlanController {
  constructor(private readonly planService: PlanService) {}

  private render = async (req: Request, res: Response) => {
    const { errors } = req

    const planUuid = req.services.sessionService.getPlanUUID()

    return res.render('pages/agree-plan', {
      locale: locale.en,
      data: {
        planUuid,
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
      optionalNote: (req.body as AgreePlanPost).notes,
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
      await this.planService.agreePlan(planUuid, agreement as PlanAgreement)

      return res.redirect(`${URLs.PLAN_SUMMARY}`)
    } catch (e) {
      return next(e)
    }
  }

  private validatePlanForAgreement = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const planUuid = req.services.sessionService.getPlanUUID()
      const plan = await this.planService.getPlanByUuid(planUuid)

      req.errors = req.errors ?? {}
      req.errors.domain = getValidationErrors(plainToInstance(Plan, plan))
      if (plan.agreementStatus !== PlanAgreementStatus.DRAFT) {
        req.errors.domain.plan = {
          alreadyAgreed: true,
        }
      }

      return next()
    } catch (e) {
      return next(e)
    }
  }

  private handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const hasErrors = Object.values(req.errors).some(errorCategory => Object.keys(errorCategory).length > 0)

    if (hasErrors) {
      if (req.method === 'POST') {
        return this.render(req, res)
      }

      return res.redirect(URLs.PLAN_SUMMARY)
    }

    return next()
  }

  get = [this.validatePlanForAgreement, this.handleValidationErrors, this.render]

  post = [
    transformRequest({
      body: AgreePlanPost,
    }),
    validateRequest(),
    this.validatePlanForAgreement,
    this.handleValidationErrors,
    this.agreePlanAndRedirect,
  ]
}
