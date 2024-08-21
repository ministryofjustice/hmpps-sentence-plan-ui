import { NextFunction, Request, Response } from 'express'
import StepService from '../../services/sentence-plan/stepsService'
import locale from './locale.json'
import { FORMS } from '../../services/formStorageService'
import URLs from '../URLs'
import { toKebabCase } from '../../utils/utils'
import { NewStep, StepStatus } from '../../@types/StepType'

export default class AddStepsController {
  constructor(private readonly stepService: StepService) {}

  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { errors } = req
      const goalResult: Record<string, any> = req.services.formStorageService.getFormData(FORMS.CREATE_GOAL)
      const {
        processed: { areaOfNeed, title: goal },
      } = goalResult
      const popData = await req.services.sessionService.getSubjectDetails()
      const stepResult: Record<string, any> = req.services.formStorageService.getFormData(FORMS.CREATE_STEPS)
      const addedSteps = stepResult ? stepResult.processed : []

      res.render('pages/create-step', {
        locale: locale.en,
        data: {
          areaOfNeed: toKebabCase(areaOfNeed),
          goal,
          form: req.body,
          addedSteps,
        },
        errors,
      })
    } catch (e) {
      next(e)
    }
  }

  post = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // const {
      //   raw: { uuid: currentGoal },
      // }: Record<string, any> = req.services.formStorageService.getFormData('currentGoal')
      const { actor, action } = req.body
      const stepName = req.body['step-input-autocomplete']
      const newStep = { description: stepName, status: '', actor } as NewStep
      if (action === 'addAnother') {
        const result: Record<string, any> = req.services.formStorageService.getFormData(FORMS.CREATE_STEPS)
        const addedSteps = result ? result.processed : []
        addedSteps.push(newStep)
        req.services.formStorageService.saveFormData(FORMS.CREATE_STEPS, {
          processed: addedSteps,
          raw: req.body,
        })
        res.redirect(`${URLs.ADD_STEPS}`)
      } else {
        // await this.stepService.saveSteps([payload], currentGoal)
        res.redirect(`${URLs.PLAN_SUMMARY}?status=success`)
      }
    } catch (e) {
      next(e)
    }
  }
}
