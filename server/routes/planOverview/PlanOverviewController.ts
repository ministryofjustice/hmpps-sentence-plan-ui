import { NextFunction, Request, Response } from 'express'
import { plainToInstance } from 'class-transformer'
import locale from './locale.json'
import { moveGoal } from '../../utils/utils'
import URLs from '../URLs'
import validateRequest, { getValidationErrors } from '../../middleware/validationMiddleware'
import PlanModel from '../shared-models/PlanModel'
import transformRequest from '../../middleware/transformMiddleware'
import PlanOverviewQueryModel from './models/PlanOverviewQueryModel'
import { AccessMode } from '../../@types/Handover'

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

      let pageToRender = 'pages/plan'

      if (
        req.services.sessionService.getPrincipalDetails().accessMode === AccessMode.READ_ONLY ||
        plan.readOnly === true
      ) {
        pageToRender = 'pages/countersign'
      }

      return res.render(pageToRender, {
        locale: locale.en,
        data: {
          plan,
          type,
          status,
          oasysReturnUrl,
        },
        errors,
      })
    } catch (e) {
      return next(e)
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
      return next(e)
    }
  }

  private validatePlanForAgreement = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const planUuid = req.services.sessionService.getPlanUUID()
      const plan = await req.services.planService.getPlanByUuid(planUuid)
      req.errors = { ...req.errors }

      req.errors.domain = getValidationErrors(plainToInstance(PlanModel, plan))

      return next()
    } catch (e) {
      return next(e)
    }
  }

  private handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const hasErrors = Object.values(req.errors).some(errorCategory => Object.keys(errorCategory).length)

    if (hasErrors) {
      if (req.errors.query?.type) {
        delete req.query.type
      }

      if (req.errors.query?.status) {
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
    transformRequest({ query: PlanOverviewQueryModel }),
    validateRequest(),
    this.handleValidationErrors,
    this.render,
  ]

  post = [this.validatePlanForAgreement, this.handleValidationErrors, this.handleSuccessRedirect]
}
