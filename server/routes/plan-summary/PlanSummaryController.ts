import { NextFunction, Request, Response } from 'express'
import locale from './locale.json'
import InfoService from '../../services/sentence-plan/infoService'
import GoalService from '../../services/sentence-plan/goalService'
import { moveGoal } from '../../utils/utils'
import URLs from '../URLs'
import { Goal } from '../../@types/GoalType'

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
      const source = req.query?.source
      const type = req.query?.type
      return res.render('pages/plan-summary', {
        locale: locale.en,
        data: {
          popData,
          currentGoals,
          futureGoals,
          type,
          source,
        },
        errors,
      })
    } catch (e) {
      return next(e)
    }
  }

  reorder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const planUuid = req.services.sessionService.getPlanUUID()
      const goals = await this.goalService.getGoals(planUuid)
      const { uuid, operation } = req.params
      const reorderedList = moveGoal(goals.now, uuid, operation)
      await this.goalService.changeGoalOrder(reorderedList)
      return res.redirect(URLs.GOALS)
    } catch (e) {
      return next(e)
    }
  }

  get = this.render
}
