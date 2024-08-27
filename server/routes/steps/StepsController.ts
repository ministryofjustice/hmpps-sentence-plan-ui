import { NextFunction, Request, Response } from 'express'
import StepService from '../../services/sentence-plan/stepsService'
import locale from './locale.json'
import { FORMS } from '../../services/formStorageService'
import URLs from '../URLs'
import options from './options'
import { toKebabCase } from '../../utils/utils'
import { NewStep, StepStatus } from '../../@types/StepType'

export default class StepsController {
  constructor(private readonly stepService: StepService) {}

  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { errors } = req
      const result: Record<string, any> = req.services.formStorageService.getFormData(FORMS.CREATE_GOAL)
      const {
        processed: { areaOfNeed, title: goal },
      } = result
      res.render('pages/create-step', {
        locale: locale.en,
        data: {
          areaOfNeed: toKebabCase(areaOfNeed),
          goal,
          form: req.body,
        },
        errors,
      })
    } catch (e) {
      next(e)
    }
  }

  post = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        raw: { uuid: currentGoal },
      }: Record<string, any> = req.services.formStorageService.getFormData('currentGoal')
      const { actor, someOneElse } = req.body
      const stepName = req.body['step-input-autocomplete']
      const popData = await req.services.sessionService.getSubjectDetails()
      const payloadOptions = [...options]
      payloadOptions.unshift({ value: 1, text: popData.givenName })
      if (someOneElse) payloadOptions[5].text = someOneElse
      const actorArray = Array.isArray(actor) ? actor : [actor]
      const actorNumbers: number[] = actorArray.map((item: string | number): number => Number(item))
      const mappedActor: Array<any> = payloadOptions.filter(option => actorNumbers.includes(option.value))
      const payload = { description: stepName, status: StepStatus.NOT_STARTED, actor: mappedActor[0].text } as NewStep
      await this.stepService.saveSteps([payload], currentGoal)
      res.redirect(`${URLs.PLAN_SUMMARY}?status=success`)
    } catch (e) {
      next(e)
    }
  }
}
