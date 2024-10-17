import { NextFunction, Request, Response } from 'express'
import { NewGoal } from '../../@types/NewGoalType'
import { GoalStatus } from '../../@types/GoalType'
import locale from './locale.json'

export default class AchieveGoalController {
  constructor() {}

  private render = async (req: Request, res: Response, next: NextFunction) => {
    const { errors } = req

    try {
      const type = req.query?.type
      const { uuid } = req.params

      const goal = await req.services.goalService.getGoal(uuid)

      return res.render('pages/confirm-achieved-goal', {
        locale: locale.en,
        data: {
          type,
          goal,
        },
        errors,
      })
    } catch (e) {
      return next(e)
    }
  }

  private saveAndRedirect = async (req: Request, res: Response, next: NextFunction) => {
    const goalUuid = req.params.uuid
    const note = req.body['goal-achievement-helped']

    const goalData: Partial<NewGoal> = {
      status: GoalStatus.ACHIEVED,
      note,
    }

    try {
      await req.services.goalService.updateGoal(goalData, goalUuid)
      return res.redirect(`/plan?type=achieved&status=achieved`)
    } catch (e) {
      return next(e)
    }
  }

  get = this.render

  post = this.saveAndRedirect
}
