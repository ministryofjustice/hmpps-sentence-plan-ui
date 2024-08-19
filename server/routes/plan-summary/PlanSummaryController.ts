import { NextFunction, Request, Response } from 'express'
import locale from './locale.json'
import InfoService from '../../services/sentence-plan/infoService'
import GoalService from '../../services/sentence-plan/goalService'
import { moveGoal } from '../../utils/utils'
import URLs from '../URLs'

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
      // TODO Goals without steps
      // TODO everything is good to agree
      // TODO no goals in this plan
      const goals = await this.goalService.getGoals(planUuid)
      const currentGoals = goals.now

      if (currentGoals.length > 0) {
        const failingGoals = currentGoals.filter(goal => goal.steps.length === 0)

        if (failingGoals.length > 0) {
          const errors = {
            body: { phil: { isNotEmpty: true } },
            params: {},
            query: {},
          }
          req.errors = errors
          return this.render(req, res, next)
        }
      }

      return res.redirect(`/plan/${planUuid}/agree`) // TODO some interpolation instead?
    } catch (e) {
      return next(e)
    }
  }

  get = this.render

  post = this.validatePlanForAgreement
}
