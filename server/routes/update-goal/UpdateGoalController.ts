import { NextFunction, Request, Response } from 'express'
import locale from './locale.json'
import ReferentialDataService from '../../services/sentence-plan/referentialDataService'
import URLs from '../URLs'
import transformRequest from '../../middleware/transformMiddleware'
import UpdateGoalPostModel from './models/UpdateGoalPostModel'

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

    const goal = await req.services.goalService.getGoal(uuid)

    const updated = goal.steps.map((value, index) => {
      // if (value.uuid != steps[index].uuid) {
      //   throw new Error("Mismatch")
      // }

      return {
        description: value.description,
        actor: value.actor,
        status: steps[index].status,
      }
    })

    await req.services.stepService.saveAllSteps(updated, uuid)

    return res.redirect(`${URLs.PLAN_OVERVIEW}`)
  }

  get = this.render

  post = [transformRequest({ body: UpdateGoalPostModel }), this.saveAndRedirect]
}
