import { NextFunction, Request, Response } from 'express'
import * as superagent from 'superagent'
import localeDelete from './locale-delete.json'
import localeRemove from './locale-remove.json'
import URLs from '../URLs'
import { PlanAgreementStatus } from '../../@types/PlanType'
import transformRequest from '../../middleware/transformMiddleware'
import RemoveGoalPostModel from './models/RemoveGoalPostModel'
import validateRequest from '../../middleware/validationMiddleware'
import { goalStatusToTabName } from '../../utils/utils'
import { requireAccessMode } from '../../middleware/authorisationMiddleware'
import { AccessMode } from '../../@types/Handover'
import { HttpError } from '../../utils/HttpError'
import { AuditEvent } from '../../services/auditService'

export default class RemoveGoalController {
  render = async (req: Request, res: Response, next: NextFunction) => {
    const { errors } = req

    try {
      const { uuid } = req.params
      let actionType
      let localeType

      const goal = await req.services.goalService.getGoal(uuid)

      const planUuid = req.services.sessionService.getPlanUUID()
      const plan = await req.services.planService.getPlanByUuid(planUuid)

      const type = goalStatusToTabName(goal.status)
      const returnLink =
        req.services.sessionService.getReturnLink() === `/confirm-delete-goal/${uuid}`
          ? URLs.PLAN_OVERVIEW
          : req.services.sessionService.getReturnLink()

      if (plan.agreementStatus === PlanAgreementStatus.DRAFT) {
        actionType = 'delete'
        localeType = localeDelete.en
        req.services.sessionService.setReturnLink(`${URLs.DELETE_GOAL.replace(':uuid', uuid)}`)
      } else {
        actionType = 'remove'
        localeType = localeRemove.en
      }

      return res.render('pages/remove-goal', {
        locale: localeType,
        data: {
          planAgreementStatus: plan.agreementStatus,
          form: req.body,
          type,
          goal,
          actionType,
          returnLink,
        },
        errors,
      })
    } catch (e) {
      return next(HttpError(500, e.message))
    }
  }

  remove = async (req: Request, res: Response, next: NextFunction) => {
    const { type } = req.body
    const { goalUuid } = req.body

    try {
      if (req.body.action === 'delete') {
        const response: superagent.Response = <superagent.Response>await req.services.goalService.deleteGoal(goalUuid)
        if (response.status === 204) {
          await req.services.auditService.send(AuditEvent.DELETE_A_GOAL, { goalUUID: goalUuid })
          return res.redirect(`${URLs.PLAN_OVERVIEW}?type=${type}&status=deleted`)
        }
      } else if (req.body.action === 'remove') {
        try {
          await req.services.goalService.removeGoal(req.body['goal-removal-note'], goalUuid)
          await req.services.auditService.send(AuditEvent.REMOVE_A_GOAL, { goalUUID: goalUuid })
          return res.redirect(`${URLs.PLAN_OVERVIEW}?type=removed&status=removed`)
        } catch (e) {
          return next(e)
        }
      }

      return res.redirect(`${URLs.PLAN_OVERVIEW}?type=${type}`)
    } catch (e) {
      return next(HttpError(500, e.message))
    }
  }

  private readonly handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    if (Object.keys(req.errors.body).length && req.body.action === 'remove') {
      return this.render(req, res, next)
    }
    return next()
  }

  get = [requireAccessMode(AccessMode.READ_WRITE), this.render]

  post = [
    requireAccessMode(AccessMode.READ_WRITE),
    transformRequest({ body: RemoveGoalPostModel }),
    validateRequest(),
    this.handleValidationErrors,
    this.remove,
  ]
}
