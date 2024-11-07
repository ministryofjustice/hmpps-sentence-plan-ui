import { NextFunction, Request, Response } from 'express'
import locale from './locale.json'
import { GoalStatus } from '../../@types/GoalType'
import URLs from '../URLs'

export default class ViewGoalDetailsController {
  private render = async (req: Request, res: Response, next: NextFunction) => {
    const { errors } = req

    try {
      const { uuid } = req.params
      const returnLink = req.services.sessionService.getReturnLink() ?? URLs.PLAN_OVERVIEW

      const goal = await req.services.goalService.getGoal(uuid)

      const validStatuses = [GoalStatus.ACHIEVED, GoalStatus.REMOVED]
      if (!validStatuses.includes(goal.status)) {
        return next()
      }

      return res.render('pages/view-goal-details', {
        locale: locale.en,
        data: {
          goal,
          returnLink,
        },
        errors,
      })
    } catch (e) {
      return next(e)
    }
  }

  get = this.render
}
