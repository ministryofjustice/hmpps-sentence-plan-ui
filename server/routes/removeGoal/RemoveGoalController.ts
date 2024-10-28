import { NextFunction, Request, Response } from 'express'
import * as superagent from 'superagent'
import localeDelete from './locale-delete.json'
import localeRemove from './locale-remove.json'
import URLs from '../URLs'
import { NewGoal } from '../../@types/NewGoalType'
import { GoalStatus } from '../../@types/GoalType'
import { PlanAgreementStatus } from '../../@types/PlanType'
import transformRequest from '../../middleware/transformMiddleware'
import RemoveGoalPostModel from './models/RemoveGoalPostModel'
import validateRequest from '../../middleware/validationMiddleware'

export default class RemoveGoalController {
  render = async (req: Request, res: Response, next: NextFunction) => {
    const { errors } = req

    try {
      const type = req.query?.type
      const { uuid } = req.params
      let actionType
      let localeType

      const goal = await req.services.goalService.getGoal(uuid)

      const planUuid = req.services.sessionService.getPlanUUID()
      const plan = await req.services.planService.getPlanByUuid(planUuid)

      if (plan.agreementStatus === PlanAgreementStatus.DRAFT) {
        actionType = 'delete'
        localeType = localeDelete.en
      } else {
        actionType = 'remove'
        localeType = localeRemove.en
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
          return res.redirect(`${URLs.PLAN_OVERVIEW}?type=${type}&status=deleted`)
        }
      } else if (req.body.action === 'remove') {
        const goalData: Partial<NewGoal> = {
          status: GoalStatus.REMOVED,
        }

        if (req.body['goal-removal-note']) {
          goalData.note = req.body['goal-removal-note']
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

  private handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    if (Object.keys(req.errors.body).length && req.body.action === 'remove') {
      return this.render(req, res, next)
    }
    return next()
  }

  get = this.render

  post = [transformRequest({ body: RemoveGoalPostModel }), validateRequest(), this.handleValidationErrors, this.remove]
}
