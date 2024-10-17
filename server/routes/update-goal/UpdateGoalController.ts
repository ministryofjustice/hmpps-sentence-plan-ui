import { NextFunction, Request, Response } from 'express'
import locale from './locale.json'
import ReferentialDataService from '../../services/sentence-plan/referentialDataService'
import URLs from '../URLs'
import transformRequest from '../../middleware/transformMiddleware'
import UpdateGoalPostModel from './models/UpdateGoalPostModel'
import StepModel from '../shared-models/StepModel'
import validateRequest from '../../middleware/validationMiddleware'
import { NewStep } from '../../@types/StepType'

export default class UpdateGoalController {
  constructor(private readonly referentialDataService: ReferentialDataService) {}

  private render = async (req: Request, res: Response, next: NextFunction) => {
    const { uuid } = req.params
    const { errors } = req

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
      },
      errors,
    })
  }

  private saveAndRedirect = async (req: Request, res: Response, next: NextFunction) => {
    const { uuid } = req.params
    const { steps } = req.body
    let error

    const goal = await req.services.goalService.getGoal(uuid)

    goal.steps.forEach((step: StepModel, index) => {
      if (step.uuid !== steps[index].uuid) {
        error = new Error('different steps were submitted')
      }
    })

    if (error) return next(error)

    const updated: NewStep[] = goal.steps.map((value, index) => {
      return {
        description: value.description,
        actor: value.actor,
        status: steps[index].status,
      }
    })

    await req.services.stepService.saveAllSteps(updated, uuid)

    return res.redirect(`${URLs.PLAN_OVERVIEW}`)
  }

  private handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    if (Object.keys(req.errors.body).length) {
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
