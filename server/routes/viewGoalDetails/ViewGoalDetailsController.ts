import { NextFunction, Request, Response } from 'express'
import locale from './locale.json'
import { GoalStatus } from '../../@types/GoalType'
import URLs from '../URLs'
import { requireAccessMode } from '../../middleware/authorisationMiddleware'
import { AccessMode } from '../../@types/Handover'
import { HttpError } from '../../utils/HttpError'
import { AuditEvent } from '../../services/auditService'

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

      if (goal.status === GoalStatus.REMOVED) {
        req.services.sessionService.setReturnLink(`/view-removed-goal/${goal.uuid}`)
      }

      await req.services.auditService.send(AuditEvent.VIEW_GOAL_DETAILS, {
        goalUUID: goal.uuid,
        goalStatus: goal.status,
      })

      return res.render('pages/view-goal-details', {
        locale: locale.en,
        data: {
          goal,
          returnLink,
        },
        errors,
      })
    } catch (e) {
      return next(HttpError(500, e.message))
    }
  }

  get = [requireAccessMode(AccessMode.READ_WRITE), this.render]
}
