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
      const popData = req.services.sessionService.getSubjectDetails()
      const type = req.query?.type
      const { uuid } = req.params
      const goal = await this.goalService.getGoal(uuid) // this is a bad idea. instead make the actions in the summary-card be submits in a form with action values and pass the goal data around

      return res.render('pages/remove-goal', {
        locale: locale.en,
        data: {
          popData,
          type,
          goal,
        },
        errors,
      })
    } catch (e) {
      return next(e)
    }
  }

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.redirect(`${URLs.PLAN_SUMMARY}?status=removed`)
    } catch (e) {
      return next(e)
    }
  }

  get = this.render

  post = (req: Request, res: Response, next: NextFunction) => {
    return this.remove(req, res, next)
  }
}
