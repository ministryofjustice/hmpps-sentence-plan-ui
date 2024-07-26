import { NextFunction, Request, Response } from 'express'
import locale from './locale.json'
import InfoService from '../../services/sentence-plan/infoService'
import GoalService from '../../services/sentence-plan/goalService'
import URLs from '../URLs'

export default class RemoveGoalController {
  constructor(
    private readonly infoService: InfoService,
    private readonly goalService: GoalService,
  ) {}

  render = async (req: Request, res: Response, next: NextFunction) => {
    const { errors } = req

    try {
      const planUuid = req.services.sessionService.getPlanUUID()
      const popData = req.services.sessionService.getSubjectDetails()
      // const goals = await this.goalService.getGoals(planUuid)

      const type = req.query?.type
      return res.render('pages/remove-goal', {
        locale: locale.en,
        data: {
          popData,
          type,
        },
        errors,
      })
    } catch (e) {
      return next(e)
    }
  }

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.redirect(URLs.GOALS)
    } catch (e) {
      return next(e)
    }
  }

  get = this.render
}
