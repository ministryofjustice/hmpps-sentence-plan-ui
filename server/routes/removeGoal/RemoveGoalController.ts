import { NextFunction, Request, Response } from 'express'
import * as superagent from 'superagent'
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
      if (req.body.action === 'remove') {
        const { goalUuid } = req.body
        const response: superagent.Response = <superagent.Response>await this.goalService.removeGoal(goalUuid)
        if (response.status === 204) {
          return res.redirect(`${URLs.PLAN_SUMMARY}?status=removed`)
        }

        // stay on this page and display error message
        return res.redirect(`${URLs.PLAN_SUMMARY}`)
      }

      return res.redirect(`${URLs.PLAN_SUMMARY}`)
    } catch (e) {
      return next(e)
    }
  }

  get = this.render

  post = (req: Request, res: Response, next: NextFunction) => {
    return this.remove(req, res, next)
  }
}
