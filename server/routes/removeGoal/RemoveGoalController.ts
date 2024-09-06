import { NextFunction, Request, Response } from 'express'
import * as superagent from 'superagent'
import locale from './locale.json'
import URLs from '../URLs'

export default class RemoveGoalController {
  render = async (req: Request, res: Response, next: NextFunction) => {
    const { errors } = req

    try {
      const type = req.query?.type
      const { uuid } = req.params
      // TODO rather than fetch the goal again we should be able to retrieve it from a local store since the previous page must have retrieved it already
      const goal = await req.services.goalService.getGoal(uuid)

      return res.render('pages/remove-goal', {
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

  remove = async (req: Request, res: Response, next: NextFunction) => {
    const { type } = req.body

    try {
      if (req.body.action === 'remove') {
        const { goalUuid } = req.body
        const response: superagent.Response = <superagent.Response>await req.services.goalService.removeGoal(goalUuid)
        if (response.status === 204) {
          return res.redirect(`${URLs.PLAN_SUMMARY}?type=${type}&status=removed`)
        }
      }

      return res.redirect(`${URLs.PLAN_SUMMARY}?type=${type}`)
    } catch (e) {
      return next(e)
    }
  }

  get = this.render

  post = (req: Request, res: Response, next: NextFunction) => {
    return this.remove(req, res, next)
  }
}
