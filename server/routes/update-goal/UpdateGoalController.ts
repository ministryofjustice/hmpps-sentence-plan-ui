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
import { sortSteps } from '../../utils/utils'

export default class UpdateGoalController {
  constructor(private readonly referentialDataService: ReferentialDataService) {}

  private render = async (req: Request, res: Response, next: NextFunction) => {
    const { uuid } = req.params
    const { errors } = req
    const goalType: string = String(req.query.type)

    req.session.goalType = String(goalType)
    req.session.backLink = `/update-goal/${uuid}?type=${goalType}`

    const sortedAreasOfNeed = this.referentialDataService.getSortedAreasOfNeed()
    const goal = await req.services.goalService.getGoal(uuid)
    const popData = req.services.sessionService.getSubjectDetails()
    const mainAreaOfNeed = sortedAreasOfNeed.find(areaOfNeed => areaOfNeed.name === goal.areaOfNeed.name)
    const relatedAreasOfNeed = goal.relatedAreasOfNeed.map(need => need.name)

    return res.render('pages/update-goal', {
      locale: locale.en,
      data: {
        goal,
        popData,
        mainAreaOfNeed,
        relatedAreasOfNeed,
        goalType,
      },
      errors,
    })
  }

  private saveAndRedirect = async (req: Request, res: Response, next: NextFunction) => {
    const { uuid } = req.params
    const { steps } = req.body

    const goal = await req.services.goalService.getGoal(uuid)

    if (goal.steps.some((step: StepModel, index) => step.uuid !== steps[index].uuid)) {
      return next(createError(400, 'different steps were submitted'))
    }

    const updated: NewStep[] = goal.steps.map((value, index) => {
      return {
        description: value.description,
        actor: value.actor,
        status: steps[index].status,
        updated: value.status === steps[index].status ? 0 : 1,
      }
    })

    sortSteps(updated)

    await req.services.stepService.saveAllSteps(updated, uuid)

    const { goalType } = req.session
    req.session.goalType = null
    req.session.backLink = null

    return res.redirect(`${URLs.PLAN_OVERVIEW}?type=${goalType}`)
  }

  private handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    if (Object.keys(req.errors.body).length) {
      req.query.type = req.session.goalType
      return this.render(req, res, next)
    }
    return next()
  }

  get = this.render

  post = [
    transformRequest({ body: UpdateGoalPostModel }),
    validateRequest(),
    this.handleValidationErrors,
    this.saveAndRedirect,
  ]
}
