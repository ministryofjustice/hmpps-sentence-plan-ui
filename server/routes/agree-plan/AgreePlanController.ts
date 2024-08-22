import { NextFunction, Request, Response } from 'express'
import { plainToInstance } from 'class-transformer'
import locale from './locale.json'
import URLs from '../URLs'
import PlanService from '../../services/sentence-plan/planService'
import transformRequest from '../../middleware/transformMiddleware'
import AgreePlanPostModel from './models/AgreePlanPostModel'
import validateRequest from '../../middleware/validationMiddleware'

export default class AgreePlanController {
  constructor(private readonly planService: PlanService) {}

  private render = async (req: Request, res: Response) => {
    const { errors } = req

    return res.render('pages/agree-plan', {
      locale: locale.en,
      data: {
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
      await this.planService.agreePlan(planUuid, agreement as PlanAgreement)

      return res.redirect(`${URLs.PLAN_SUMMARY}`)
    } catch (e) {
      return next(e)
    }
  }

  private handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    if (Object.keys(req.errors.body).length) {
      return this.render(req, res, next)
    }
    return next()
  }

  get = this.render

  post = [
    transformRequest({
      body: AgreePlanPostModel,
    }),
    validateRequest(),
    this.handleValidationErrors,
    this.saveAndRedirect,
  ]
}
