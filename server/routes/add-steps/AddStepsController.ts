import { NextFunction, Request, Response } from 'express'
import StepService from '../../services/sentence-plan/stepsService'
import locale from './locale.json'
import GoalService from '../../services/sentence-plan/goalService'
import URLs from '../URLs'
import { toKebabCase } from '../../utils/utils'
import validateRequest from '../../middleware/validationMiddleware'
import AddStepsPostModel, { StepModel } from './models/AddStepsPostModel'
import transformRequest from '../../middleware/transformMiddleware'
import { StepStatus } from '../../@types/StepType'

export default class AddStepsController {
  private render = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { errors } = req
      const popData = await req.services.sessionService.getSubjectDetails()
      const goal = await req.services.goalService.getGoal(req.params.uuid)
      const steps = await req.services.stepService.getSteps(req.params.uuid)

      if (!req.body.steps || req.body.steps.length === 0) {
        req.body.steps = steps.map(step => ({
          actor: step.actor,
          description: step.description,
        }))
      }

      return res.render('pages/add-steps', {
        locale: locale.en,
        data: {
          goal,
          popData,
          areaOfNeed: toKebabCase(goal.areaOfNeed.name),
          form: req.body,
        },
        errors,
      })
    } catch (e) {
      return next(e)
    }
  }

  private saveAndRedirect = async (req: Request, res: Response, next: NextFunction) => {
    const goalUuid = req.params.uuid
    await req.services.stepService.saveAllSteps(
      req.body.steps.map((step: StepModel) => ({
        description: step.description,
        actor: step.actor,
        status: StepStatus.NOT_STARTED,
      })),
      goalUuid,
    )

    return res.redirect(`${URLs.PLAN_SUMMARY}?status=success`)
  }

  private handleRemoveStep = (req: Request, res: Response, next: NextFunction) => {
    if (req.body.action.startsWith('remove-step-')) {
      const index = parseInt(req.body.action.split('remove-step-')[1], 10) - 1

      if (!Number.isNaN(index) && index >= 0 && index < req.body.steps.length) {
        delete req.body.action
        delete req.body[`step-actor-${index + 1}`]
        delete req.body[`step-description-${index + 1}`]
        req.body.steps.splice(index, 1)

        return this.render(req, res, next)
      }

      return next(new Error('Invalid array'))
    }

    return next()
  }

  private handleAddStep = (req: Request, res: Response, next: NextFunction) => {
    if (req.body.action === 'add-step') {
      delete req.body.action
      req.body.steps.push({
        actor: req.services.sessionService.getSubjectDetails().givenName,
        description: '',
      })

      return this.render(req, res, next)
    }
    return next()
  }

  private handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    if (Object.keys(req.errors?.body).length) {
      return this.render(req, res, next)
    }
    return next()
  }

  post = [
    transformRequest({
      body: AddStepsPostModel,
    }),
    this.handleRemoveStep,
    this.handleAddStep,
    validateRequest(),
    this.handleValidationErrors,
    this.saveAndRedirect,
  ]

  get = this.render
}
