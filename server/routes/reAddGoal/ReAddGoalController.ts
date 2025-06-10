import { NextFunction, Request, Response } from 'express'
import { GoalStatus } from '../../@types/GoalType'
import locale from './locale.json'
import validateRequest from '../../middleware/validationMiddleware'
import transformRequest from '../../middleware/transformMiddleware'
import ReAddGoalPostModel from './models/ReAddGoalPostModel'
import { requireAccessMode } from '../../middleware/authorisationMiddleware'
import { AccessMode } from '../../@types/Handover'
import { HttpError } from '../../utils/HttpError'
import { goalStatusToTabName } from '../../utils/utils'
import { getDateOptions, getGoalTargetDate } from '../../utils/goalTargetDateUtils'
import { ReAddGoal } from '../../@types/ReAddGoal'
import { AuditEvent } from '../../services/auditService'

export default class ReAddGoalController {
  constructor() {}

  private render = async (req: Request, res: Response, next: NextFunction) => {
    const { errors } = req

    try {
      const { uuid } = req.params

      const goal = await req.services.goalService.getGoal(uuid)
      const returnLink = req.services.sessionService.getReturnLink()
      const dateOptions = getDateOptions()
      const form = errors ? req.body : null

      req.services.sessionService.setReturnLink(`/plan?type=removed`)

      return res.render('pages/confirm-re-add-goal', {
        locale: locale.en,
        data: {
          dateOptions,
          returnLink,
          goal,
          form,
        },
        errors,
      })
    } catch (e) {
      return next(HttpError(500, e.message))
    }
  }

  private saveAndRedirect = async (req: Request, res: Response, next: NextFunction) => {
    const goalUuid = req.params.uuid

    const reAddGoal: ReAddGoal = {
      note: req.body['re-add-goal-reason'],
      targetDate: getGoalTargetDate(
        req.body['start-working-goal-radio'],
        req.body['date-selection-radio'],
        req.body['date-selection-custom'],
      ),
    }

    const status = reAddGoal.targetDate === null ? GoalStatus.FUTURE : GoalStatus.ACTIVE

    try {
      await req.services.goalService.reAddGoal(reAddGoal, goalUuid)
      await req.services.auditService.send(AuditEvent.ADD_A_GOAL_BACK_TO_PLAN, { goalUUID: goalUuid })
      return res.redirect(`/plan?type=${goalStatusToTabName(status)}`)
    } catch (e) {
      return next(HttpError(500, e.message))
    }
  }

  private handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    if (Object.keys(req.errors?.body).length) {
      return this.render(req, res, next)
    }
    return next()
  }

  get = [requireAccessMode(AccessMode.READ_WRITE), this.render]

  post = [
    requireAccessMode(AccessMode.READ_WRITE),
    transformRequest({ body: ReAddGoalPostModel }),
    validateRequest(),
    this.handleValidationErrors,
    this.saveAndRedirect,
  ]
}
