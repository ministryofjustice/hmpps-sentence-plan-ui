import { NextFunction, Request, Response } from 'express'
import locale from './locale.json'
import InfoService from '../../services/sentence-plan/infoService'
import GoalService from '../../services/sentence-plan/goalService'
import { getCurrentGoals, getFutureGoals, moveGoal } from '../../utils/utils'
import URLs from '../URLs'

export default class GoalsController {
  constructor(
    private readonly infoService: InfoService,
    private readonly goalService: GoalService,
  ) {}

  render = async (req: Request, res: Response, next: NextFunction) => {
    const crn = 'X756510' // TODO: This is likely to be a session value, get from there
    const { errors } = req

    try {
      const popData = await this.infoService.getPopData(crn)
      const goals = await this.goalService.getGoals()
      const currentGoals = getCurrentGoals(goals).map((goal, i, main) => {
        const newGoal = { ...goal }
        if (i > 0) newGoal.moveUpURL = `${URLs.GOALS}/${goal.uuid}/up`
        if (i < main.length - 1) newGoal.moveDownURL = `${URLs.GOALS}/${goal.uuid}/down`
        newGoal.goalOrder = i + 1
        return newGoal
      })
      const futureGoals = getFutureGoals(goals).map((goal, i, main) => {
        const newGoal = { ...goal }
        if (i > 0) newGoal.moveUpURL = `${URLs.GOALS}/${goal.uuid}/up`
        if (i < main.length - 1) newGoal.moveDownURL = `${URLs.GOALS}/${goal.uuid}/down`
        newGoal.goalOrder = currentGoals.length + i + 1
        return newGoal
      })
      return res.render('pages/goals', {
        locale: locale.en,
        data: {
          popData,
          currentGoals,
          futureGoals,
        },
        errors,
      })
    } catch (e) {
      return next(e)
    }
  }

  reorder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const goals = await this.goalService.getGoals()
      const { uuid, operation } = req.params
      const reorderedList = moveGoal(goals, uuid, operation)
      await this.goalService.changeGoalOrder(reorderedList)
      return res.redirect(URLs.GOALS)
    } catch (e) {
      return next(e)
    }
  }

  get = this.render
}
