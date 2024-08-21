import { NextFunction, Request, Response } from 'express'
import locale from './locale.json'
import InfoService from '../../services/sentence-plan/infoService'
import GoalService from '../../services/sentence-plan/goalService'
import { moveGoal } from '../../utils/utils'
import URLs from '../URLs'
import { getValidationErrors } from '../../middleware/validationMiddleware'
import AgreePlanValidationModel from '../agree-plan/models/AgreePlanValidationModel'

export default class PlanSummaryController {
  constructor(
    private readonly infoService: InfoService,
    private readonly goalService: GoalService,
  ) {}

  render = async (req: Request, res: Response, next: NextFunction) => {
    const { errors } = req

    try {
      const planUuid = req.services.sessionService.getPlanUUID()
      const popData = req.services.sessionService.getSubjectDetails()
      const goals = await this.goalService.getGoals(planUuid)
      const currentGoals = goals.now
      const futureGoals = goals.future
      const status = req.query?.status
      const type = req.query?.type
      return res.render('pages/plan-summary', {
        locale: locale.en,
        data: {
          planUuid,
          popData,
          currentGoals,
          futureGoals,
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

  validatePlanForAgreement = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const planUuid = req.services.sessionService.getPlanUUID()
      const goals = await this.goalService.getGoals(planUuid)

      const errors = getValidationErrors(goals, AgreePlanValidationModel)

      console.log(errors)

      if (Object.keys(errors).length > 0) {
        req.errors = { body: errors }
        return this.render(req, res, next)
      }

      return res.redirect(`/plan/${planUuid}/agree`)
    } catch (e) {
      return next(e)
    }
  }

  get = this.render

  post = this.validatePlanForAgreement
}
