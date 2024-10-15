import { NextFunction, Request, Response } from 'express'
import * as superagent from 'superagent'
import locale from './locale.json'
import URLs from '../URLs'
import { NewGoal } from '../../@types/NewGoalType'
import { GoalStatus } from '../../@types/GoalType'
import { PlanAgreementStatus } from '../../@types/PlanType'

export default class RemoveGoalController {
  render = async (req: Request, res: Response, next: NextFunction) => {
    const { errors } = req

    try {
      const type = req.query?.type
      const { uuid } = req.params

      const goal = await req.services.goalService.getGoal(uuid)
      let actionType = 'remove'
      let localeType = locale.en.remove

      const planUuid = req.services.sessionService.getPlanUUID()
      const plan = await req.services.planService.getPlanByUuid(planUuid)

      if (plan.agreementStatus === PlanAgreementStatus.DRAFT) {
        actionType = 'delete'
        localeType = locale.en.delete
      }

      return res.render('pages/remove-goal', {
        locale: localeType,
        data: {
          type,
          goal,
          actionType,
        },
        errors,
      })
    } catch (e) {
      return next(e)
    }
  }

  remove = async (req: Request, res: Response, next: NextFunction) => {
    const { type } = req.body
    const { goalUuid } = req.body

    try {
      if (req.body.action === 'delete') {
        const response: superagent.Response = <superagent.Response>await req.services.goalService.deleteGoal(goalUuid)
        if (response.status === 204) {
          return res.redirect(`${URLs.PLAN_OVERVIEW}?type=${type}&status=removed`)
        }
      } else if (req.body.action === 'remove') {
        const goalData: Partial<NewGoal> = {
          status: GoalStatus.REMOVED,
        }

        try {
          await req.services.goalService.updateGoal(goalData, goalUuid)
          return res.redirect(`${URLs.PLAN_OVERVIEW}?type=${type}&status=removed`)
        } catch (e) {
          return next(e)
        }
      }

      return res.redirect(`${URLs.PLAN_OVERVIEW}?type=${type}`)
    } catch (e) {
      return next(e)
    }
  }

  get = this.render

  post = (req: Request, res: Response, next: NextFunction) => {
    return this.remove(req, res, next)
  }
}
