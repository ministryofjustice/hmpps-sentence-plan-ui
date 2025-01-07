import { NextFunction, Request, Response } from 'express'
import { plainToInstance } from 'class-transformer'
import locale from './locale.json'
import { moveGoal } from '../../utils/utils'
import URLs from '../URLs'
import validateRequest, { getValidationErrors } from '../../middleware/validationMiddleware'
import PlanReadyForAgreementModel from '../shared-models/PlanReadyForAgreementModel'
import AgreedPlanModel from '../shared-models/AgreedPlanModel'
import transformRequest from '../../middleware/transformMiddleware'
import PlanOverviewQueryModel from './models/PlanOverviewQueryModel'
import { AccessMode } from '../../@types/Handover'
import { requireAccessMode } from '../../middleware/authorisationMiddleware'
import { HttpError } from '../../utils/HttpError'
import { PlanAgreementStatus } from '../../@types/PlanType'

export default class PlanOverviewController {
  private render = async (req: Request, res: Response, next: NextFunction) => {
    const { errors } = req

    try {
      const planUuid = req.services.sessionService.getPlanUUID()
      const planVersionNumber = req.services.sessionService.getPlanVersionNumber()

      let plan

      if (planVersionNumber != null) {
        plan = await req.services.planService.getPlanByUuidAndVersionNumber(planUuid, planVersionNumber)
      } else {
        plan = await req.services.planService.getPlanByUuid(planUuid)
      }

      const oasysReturnUrl = req.services.sessionService.getOasysReturnUrl()
      const type = req.query?.type ?? 'current'
      const status = req.query?.status

      req.services.sessionService.setReturnLink(`/plan?type=${type ?? 'current'}`)

      const readWrite = req.services.sessionService.getAccessMode() === AccessMode.READ_WRITE

      const page = 'pages/plan'

      return res.render(page, {
        locale: locale.en,
        data: {
          plan,
          type,
          status,
          oasysReturnUrl,
          readWrite,
        },
        errors,
      })
    } catch (e) {
      return next(HttpError(500, e.message))
    }
  }

  reorderGoals = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const planUuid = req.services.sessionService.getPlanUUID()
      const goals = await req.services.goalService.getGoals(planUuid)
      const { uuid, type, operation } = req.params
      const goalList = type === 'current' ? goals.now : goals.future
      const reorderedList = moveGoal(goalList, uuid, operation)
      await req.services.goalService.changeGoalOrder(reorderedList)
      return res.redirect(`${URLs.PLAN_OVERVIEW}?type=${type}`)
    } catch (e) {
      return next(HttpError(500, e.message))
    }
  }

  private validatePlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const planUuid = req.services.sessionService.getPlanUUID()
      const plan = await req.services.planService.getPlanByUuid(planUuid)
      req.errors = { ...req.errors }

      let validationModel

      if (req.method === 'POST' && plan.agreementStatus === PlanAgreementStatus.DRAFT) {
        validationModel = PlanReadyForAgreementModel
      } else if (req.method === 'GET' && plan.agreementStatus !== PlanAgreementStatus.DRAFT) {
        validationModel = AgreedPlanModel
      }

      if (validationModel) {
        req.errors.domain = getValidationErrors(plainToInstance(validationModel, plan))
      }

      return next()
    } catch (e) {
      return next(HttpError(500, e.message))
    }
  }

  private handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const hasErrors = Object.values(req.errors).some(errorCategory => Object.keys(errorCategory).length)

    if (hasErrors) {
      if (req.query?.type) {
        delete req.query.type
      }

      if (req.query?.status) {
        delete req.query.status
      }

      return this.render(req, res, next)
    }

    return next()
  }

  private handleSuccessRedirect = (req: Request, res: Response) => {
    return res.redirect(URLs.AGREE_PLAN)
  }

  get = [
    requireAccessMode(AccessMode.READ_ONLY),
    transformRequest({ query: PlanOverviewQueryModel }),
    validateRequest(),
    this.validatePlan,
    this.handleValidationErrors,
    this.render,
  ]

  post = [
    requireAccessMode(AccessMode.READ_WRITE),
    this.validatePlan,
    this.handleValidationErrors,
    this.handleSuccessRedirect,
  ]
}
