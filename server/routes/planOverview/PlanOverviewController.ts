import { NextFunction, Request, Response } from 'express'
import { plainToInstance } from 'class-transformer'
import locale from './locale.json'
import { moveGoal } from '../../utils/utils'
import URLs from '../URLs'
import { getValidationErrors } from '../../middleware/validationMiddleware'
import PlanModel from '../shared-models/PlanModel'

export default class PlanOverviewController {
  private render = async (req: Request, res: Response, next: NextFunction) => {
    const { errors } = req

    try {
      const planUuid = req.services.sessionService.getPlanUUID()
      const plan = await req.services.planService.getPlanByUuid(planUuid)
      const oasysReturnUrl = req.services.sessionService.getOasysReturnUrl()
      const requestedStatus = String(req.query?.status)
      const requestedType = String(req.query?.type)

      const validGoalTypes = ['current', 'future', 'removed', 'completed']
      const type = validGoalTypes.includes(<string>requestedType) ? requestedType : 'current'

      const validStatusTypes = ['added', 'changed', 'removed', 'deleted', 'achieved']
      const status = validStatusTypes.includes(<string>requestedStatus) ? requestedStatus : undefined

      req.services.sessionService.setReturnLink(`/plan?type=${type ?? 'current'}`)

      return res.render('pages/plan', {
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
      return this.render(req, res, next)
    }

    return next()
  }

  private handleSuccessRedirect = (req: Request, res: Response) => {
    return res.redirect(URLs.AGREE_PLAN)
  }

  get = this.render

  post = [this.validatePlanForAgreement, this.handleValidationErrors, this.handleSuccessRedirect]
}
