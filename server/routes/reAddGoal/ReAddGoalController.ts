import { NextFunction, Request, Response } from 'express'
import { Goal, GoalStatus } from '../../@types/GoalType'
import locale from './locale.json'
import validateRequest from '../../middleware/validationMiddleware'
import transformRequest from '../../middleware/transformMiddleware'
import ReAddGoalPostModel from './models/ReAddGoalPostModel'
import { requireAccessMode } from '../../middleware/authorisationMiddleware'
import { AccessMode } from '../../@types/Handover'
import { HttpError } from '../../utils/HttpError'
import { dateToISOFormat, getAchieveDateOptions } from '../../utils/utils'
import { NewGoal } from '../../@types/NewGoalType'

export default class ReAddGoalController {
  constructor() {}

  private render = async (req: Request, res: Response, next: NextFunction) => {
    const { errors } = req

    try {
      const type = req.query?.type
      const { uuid } = req.params

      const goal = await req.services.goalService.getGoal(uuid)
      const returnLink = req.services.sessionService.getReturnLink()
      const dateOptions = this.getDateOptions()

      req.services.sessionService.setReturnLink(`/plan?type=removed`)

      return res.render('pages/confirm-re-add-goal', {
        locale: locale.en,
        data: {
          form: req.body,
          type,
          dateOptions,
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

    // retrieve full goal
    const goal: Goal = await req.services.goalService.getGoal(goalUuid)

    const newGoal: NewGoal = {
      title: goal.title,
      areaOfNeed: goal.areaOfNeed.name,
      relatedAreasOfNeed: goal.relatedAreasOfNeed.map(aon => aon.name),
    }

    // set note
    newGoal.note = req.body['re-add-goal-reason']

    // set new targetDate
    // TODO this is now in three files - extract it
    newGoal.targetDate =
      // eslint-disable-next-line no-nested-ternary
      req.body['start-working-goal-radio'] === 'yes'
        ? req.body['date-selection-radio'] === 'custom'
          ? dateToISOFormat(req.body['date-selection-custom'])
          : req.body['date-selection-radio']
        : null

    // set new status
    newGoal.status = goal.targetDate === null ? GoalStatus.FUTURE : GoalStatus.ACTIVE

    try {
      // probably need to use replaceGoal here - updateGoal is only good for status changes - should rename that function in GoalService.ts
      await req.services.goalService.replaceGoal(newGoal, goalUuid)
      // TODO where does this go?
      return res.redirect(`/plan`)
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

  // todo duplicated from creategoalcontroller and changegoalcontroller
  private getDateOptions = () => {
    const today = new Date()
    return getAchieveDateOptions(today)
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
