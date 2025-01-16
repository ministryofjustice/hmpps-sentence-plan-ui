import { NextFunction, Request, Response } from 'express'
import createError from 'http-errors'
import locale from './locale.json'
import ReferentialDataService from '../../services/sentence-plan/referentialDataService'
import URLs from '../URLs'
import transformRequest from '../../middleware/transformMiddleware'
import UpdateGoalPostModel from './models/UpdateGoalPostModel'
import StepModel from '../shared-models/StepModel'
import validateRequest from '../../middleware/validationMiddleware'
import { NewStep } from '../../@types/StepType'
import { goalStatusToTabName, sortSteps } from '../../utils/utils'
import { NewGoal } from '../../@types/NewGoalType'
import { Goal } from '../../@types/GoalType'
import { requireAccessMode } from '../../middleware/authorisationMiddleware'
import { AccessMode } from '../../@types/Handover'
import { HttpError } from '../../utils/HttpError'

export default class UpdateGoalController {
  constructor(private readonly referentialDataService: ReferentialDataService) {}

  private render = async (req: Request, res: Response, next: NextFunction) => {
    const { uuid } = req.params
    const { errors } = req

    try {
      const sortedAreasOfNeed = this.referentialDataService.getSortedAreasOfNeed()
      const goal = await req.services.goalService.getGoal(uuid)
      const goalType: string = goalStatusToTabName(goal.status)
      const popData = req.services.sessionService.getSubjectDetails()
      const mainAreaOfNeed = sortedAreasOfNeed.find(areaOfNeed => areaOfNeed.name === goal.areaOfNeed.name)
      const relatedAreasOfNeed = goal.relatedAreasOfNeed.map(need => need.name)

      const returnLink = req.services.sessionService.getReturnLink()
      req.services.sessionService.setReturnLink(`/update-goal-steps/${uuid}`)

      return res.render('pages/update-goal', {
        locale: locale.en,
        data: {
          form: req.body,
          goal,
          popData,
          mainAreaOfNeed,
          relatedAreasOfNeed,
          returnLink,
          goalType,
        },
        errors,
      })
    } catch (e) {
      return next(HttpError(500, e.message))
    }
  }

  private async updateSteps(req: Request, goal: Goal, steps: StepModel[], note: string) {
    if (goal.steps.some((step: StepModel, index) => step.uuid !== steps[index].uuid)) {
      throw createError(400, 'different steps were submitted')
    }

    const updatedSteps: NewStep[] = goal.steps.map((value, index) => {
      return {
        description: value.description,
        actor: value.actor,
        status: steps[index].status,
        updated: value.status === steps[index].status ? 0 : 1,
      }
    })

    sortSteps(updatedSteps)

    const goalData: Partial<NewGoal> = {
      steps: updatedSteps,
      note: note || null,
    }

    if (updatedSteps.length > 0 || note) {
      await req.services.stepService.saveAllSteps(goalData, goal.uuid)
    }
  }

  private saveAndRedirect = async (req: Request, res: Response, next: NextFunction) => {
    const { uuid } = req.params
    const { steps } = req.body
    const note = req.body['more-detail']

    try {
      const goal = await req.services.goalService.getGoal(uuid)
      const goalType: string = goalStatusToTabName(goal.status)

      await this.updateSteps(req, goal, steps, note)

      return res.redirect(`${URLs.PLAN_OVERVIEW}?type=${goalType}`)

      // TODO SP2-633
      // if (steps.length === 0 || steps.some((step: { status: string }) => step.status !== 'COMPLETED')) {
      //   req.services.sessionService.setReturnLink(null)
      //   return res.redirect(`${URLs.PLAN_OVERVIEW}?type=${goalType}`)
      // }
      // return res.redirect(`${URLs.ACHIEVE_GOAL.replace(':uuid', uuid)}`)
    } catch (e) {
      return next(HttpError(500, e.message))
    }
  }

  private handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    if (Object.keys(req.errors.body).length) {
      return this.render(req, res, next)
    }
    return next()
  }

  get = [requireAccessMode(AccessMode.READ_WRITE), this.render]

  post = [
    requireAccessMode(AccessMode.READ_WRITE),
    transformRequest({ body: UpdateGoalPostModel }),
    validateRequest(),
    this.handleValidationErrors,
    this.saveAndRedirect,
  ]
}
