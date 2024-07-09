import { Request, Response, NextFunction } from 'express'
import StepService from '../../services/sentence-plan/stepsService'
import InfoService from '../../services/sentence-plan/infoService'
import ReferentialDataService from '../../services/sentence-plan/referentialDataService'
import locale from './locale.json'
import { FORMS } from '../../services/formStorageService'
import { NewStep } from '../../@types/NewStepType'
import URLs from '../URLs'
import options from './options'

const crn = 'A123456'

export default class StepsController {
  constructor(
    private readonly stepService: StepService,
    private readonly referentialDataService: ReferentialDataService,
    private readonly infoService: InfoService,
  ) {}

  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { errors } = req
      const result: Record<string, any> = req.services.formStorageService.getFormData(FORMS.CREATE_GOAL)
      const {
        processed: { areaOfNeed, title: goal },
      } = result
      const popData = await this.infoService.getPopData(crn)
      res.render('pages/create-step', {
        locale: locale.en,
        data: {
          popData,
          areaOfNeed,
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
      const stepName = req.body['input-autocomplete']
      const payloadOptions = [...options]
      if (someOneElse) payloadOptions[5].text = someOneElse
      const actorArray = Array.isArray(actor) ? actor : [actor]
      const actorNumbers: number[] = actorArray.map((item: string | number): number => Number(item))
      const mappedActor: Array<any> = payloadOptions.filter(option => actorNumbers.includes(option.value))
      const actors = transformActor(mappedActor)
      const payload = { description: stepName, status: '', actor: actors } as NewStep
      await this.stepService.saveSteps([payload], currentGoal)
      res.redirect(URLs.CREATE_STEP)
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