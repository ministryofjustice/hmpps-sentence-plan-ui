import { NextFunction, Request, Response } from 'express'
import { plainToInstance } from 'class-transformer'
import locale from './locale.json'
import GoalService from '../../services/sentence-plan/goalService'
import { moveGoal } from '../../utils/utils'
import URLs from '../URLs'
import { getValidationErrors } from '../../middleware/validationMiddleware'
import PlanService from '../../services/sentence-plan/planService'
import PlanModel from '../shared-models/PlanModel'

export default class PlanSummaryController {
  constructor(
    private readonly planService: PlanService,
    private readonly goalService: GoalService,
  ) {}

  private render = async (req: Request, res: Response, next: NextFunction) => {
    const { errors } = req

    try {
      const planUuid = req.services.sessionService.getPlanUUID()
      const plan = await this.planService.getPlanByUuid(planUuid)
      const status = req.query?.status
      const type = req.query?.type

      return res.render('pages/plan-summary', {
        locale: locale.en,
        data: {
          plan,
          type,
          status,
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
      const goals = await this.goalService.getGoals(planUuid)
      const { uuid, type, operation } = req.params
      const goalList = type === 'current' ? goals.now : goals.future
      const reorderedList = moveGoal(goalList, uuid, operation)
      await this.goalService.changeGoalOrder(reorderedList)
      return res.redirect(`${URLs.PLAN_SUMMARY}?type=${type}`)
    } catch (e) {
      return next(e)
    }
  }

  private validatePlanForAgreement = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const planUuid = req.services.sessionService.getPlanUUID()
      const plan = await this.planService.getPlanByUuid(planUuid)
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
