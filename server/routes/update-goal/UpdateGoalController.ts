import { NextFunction, Request, Response } from 'express'
import locale from './locale.json'
import ReferentialDataService from '../../services/sentence-plan/referentialDataService'
import URLs from '../URLs'
import transformRequest from '../../middleware/transformMiddleware'
import UpdateGoalPostModel from './models/UpdateGoalPostModel'
import { StepModel } from '../add-steps/models/AddStepsPostModel'

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
    const goal = await req.services.goalService.getGoal(uuid)
    const updated: StepModel[] = goal.steps
    const map = updated.map((value, index) => {
      return {
        description: value.description,
        actor: value.actor,
        status: req.body[`step-status-${index + 1}`],
      }
    })

    await req.services.stepService.saveAllSteps(map, uuid)

    return res.redirect(`${URLs.PLAN_SUMMARY}?status=success`)
  }

  private consoleLog = async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body)
    next()
  }

  get = this.render

  post = [this.consoleLog, transformRequest({ body: UpdateGoalPostModel }), this.saveAndRedirect]
}
