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
import { NewGoal } from '../../@types/NewGoalType'

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

  private async updateSteps(req: Request, uuid: string, steps: StepModel[]) {
    const goal = await req.services.goalService.getGoal(uuid)

    if (goal.steps.some((step: StepModel, index) => step.uuid !== steps[index].uuid)) {
      throw createError(400, 'different steps were submitted')
    }

    const updated: NewStep[] = goal.steps.map((value, index) => {
      return {
        description: value.description,
        actor: value.actor,
        status: steps[index].status,
      }
    })

    await req.services.stepService.saveAllSteps(updated, uuid)
  }

  private async addNoteToGoal(req: Request, uuid: string, note: string) {
    const goalData: Partial<NewGoal> = {
      note,
    }

    await req.services.goalService.updateGoal(goalData, uuid)
  }

  private saveAndRedirect = async (req: Request, res: Response, next: NextFunction) => {
    const { uuid } = req.params
    const { steps } = req.body
    const note = req.body.moreDetail

    try {
      await this.updateSteps(req, uuid, steps)
      await this.addNoteToGoal(req, uuid, note)
      return res.redirect(`${URLs.PLAN_OVERVIEW}`)
    } catch (e) {
      return next(e)
    }
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
