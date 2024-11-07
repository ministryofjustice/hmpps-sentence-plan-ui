import { NextFunction, Request, Response } from 'express'
import locale from './locale.json'
import { GoalStatus } from '../../@types/GoalType'

export default class ViewGoalDetailsController {
  private render = async (req: Request, res: Response, next: NextFunction) => {
    const { errors } = req

    try {
      const { uuid } = req.params
      const type = req.query?.type

      const goal = await req.services.goalService.getGoal(uuid)

      const validStatuses = [GoalStatus.ACHIEVED, GoalStatus.REMOVED]
      if (!validStatuses.includes(goal.status)) {
        res.redirect(`/plan?type=${type}`)
      }

      return res.render('pages/view-goal-details', {
        locale: locale.en,
        data: {
          goal,
        },
        errors,
      })
    } catch (e) {
      return next(e)
    }
  }

  get = this.render
}
