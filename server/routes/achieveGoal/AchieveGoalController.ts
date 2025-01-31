import { NextFunction, Request, Response } from 'express'
import { NewGoal } from '../../@types/NewGoalType'
import { GoalStatus } from '../../@types/GoalType'
import locale from './locale.json'
import validateRequest from '../../middleware/validationMiddleware'
import transformRequest from '../../middleware/transformMiddleware'
import AchieveGoalPostModel from './models/AchieveGoalPostModel'
import { requireAccessMode } from '../../middleware/authorisationMiddleware'
import { AccessMode } from '../../@types/Handover'
import { HttpError } from '../../utils/HttpError'
import URLs from '../URLs'
import { goalStatusToTabName } from '../../utils/utils'

export default class AchieveGoalController {
  constructor() {}

  private render = async (req: Request, res: Response, next: NextFunction) => {
    const { errors } = req

    try {
      const type = req.query?.type
      const { uuid } = req.params

      const goal = await req.services.goalService.getGoal(uuid)
      const returnLink = req.services.sessionService.getReturnLink()

      return res.render('pages/confirm-if-achieved', {
        locale: locale.en,
        data: {
          form: req.body,
          type,
          returnLink,
          goal,
        },
        errors,
      })
    } catch (e) {
      return next(HttpError(500, e.message))
    }
  }

  private saveAndRedirect = async (req: Request, res: Response, next: NextFunction) => {
    const goalUuid = req.params.uuid
    const isAchieved = req.body['is-goal-achieved-radio'] === 'yes'
    const note = req.body['goal-achievement-helped']

    if (!isAchieved) {
      try {
        const goal = await req.services.goalService.getGoal(goalUuid)
        const goalType: string = goalStatusToTabName(goal.status)

        return res.redirect(`${URLs.PLAN_OVERVIEW}?type=${goalType}`)
      } catch (e) {
        return next(HttpError(500, e.message))
      }
    }

    const goalData: Partial<NewGoal> = {
      status: GoalStatus.ACHIEVED,
      note,
    }

    try {
      await req.services.goalService.updateGoalStatus(goalData, goalUuid)
      return res.redirect(`/plan?type=achieved&status=achieved`)
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
    transformRequest({ body: AchieveGoalPostModel }),
    validateRequest(),
    this.handleValidationErrors,
    this.saveAndRedirect,
  ]
}
