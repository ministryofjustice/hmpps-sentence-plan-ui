import { Request, Response, NextFunction } from 'express'
import StepService from '../../services/sentence-plan/stepsService'
import locale from './locale.json'
import { FORMS } from '../../services/formStorageService'
import { NewStep } from '../../@types/NewStepType'
import URLs from '../URLs'
import options from './options'
import { toKebabCase } from '../../utils/utils'

export default class StepsController {
  constructor(private readonly stepService: StepService) {}

  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { errors } = req
      const result: Record<string, any> = req.services.formStorageService.getFormData(FORMS.CREATE_GOAL)
      const {
        processed: { areaOfNeed, title: goal },
      } = result
      const popData = await req.services.sessionService.getSubjectDetails()
      res.render('pages/create-step', {
        locale: locale.en,
        data: {
          popData,
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
      const actors = transformActor(mappedActor)
      const payload = { description: stepName, status: '', actor: actors } as NewStep
      await this.stepService.saveSteps([payload], currentGoal)
      res.redirect(`${URLs.PLAN_SUMMARY}?status=success`)
    } catch (e) {
      next(e)
    }
  }
}

function transformActor(mappedActor: Array<any>): Array<any> {
  const actorArray: Array<any> = []
  mappedActor.forEach(obj => {
    actorArray.push({ actor: obj.text, actorOptionId: obj.value })
  })
  return actorArray
}
