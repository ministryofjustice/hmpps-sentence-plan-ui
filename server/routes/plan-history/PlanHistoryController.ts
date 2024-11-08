import { NextFunction, Request, Response } from 'express'
import locale from './locale.json'

export default class PlanHistoryController {
  private render = async (req: Request, res: Response, next: NextFunction) => {
    const { errors } = req

    try {
      const { uuid } = req.params

      const goal = await req.services.goalService.getGoal(uuid)

      return res.render('pages/plan-history', {
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
