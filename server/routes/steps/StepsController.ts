import { Request, Response, NextFunction } from 'express'
import StepService from '../../services/sentence-plan/stepsService'
import InfoService from '../../services/sentence-plan/infoService'
import ReferentialDataService from '../../services/sentence-plan/referentialDataService'
import locale from './locale.json'
import { FORMS } from '../../services/formStorageService'
import { NewStep } from '../../@types/NewStepType'
import URLs from '../URLs'

const options = [
  {
    value: 1,
    text: '',
  },
  {
    value: 2,
    text: 'Probation practitioner',
  },
  {
    value: 3,
    text: 'Programme staff',
  },
  {
    value: 4,
    text: 'Partnership agency',
  },
  {
    value: 5,
    text: 'Commissioned rehabilitative services (CRS) provider',
  },
  {
    value: 6,
    text: 'Someone else',
    conditional: {
      html: `
      <div class="govuk-form-group">
        <h1 class="govuk-label-wrapper">
          <label class="govuk-label govuk-label--s" for="some-one-else">
          Enter who will do this step
          </label>
        </h1>
        <input class="govuk-input govuk-!-width-one-third" id="some-one-else" name="someOneElse" type="text">
      </div>`,
    },
  },
]

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
      const checkboxOptions = [...options]
      checkboxOptions[0].text = popData.firstName
      res.render('pages/create-step', {
        locale: locale.en,
        data: {
          popData,
          areaOfNeed,
          checkboxOptions,
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
      const { stepName, actor, someOneElse } = req.body
      const payloadOptions = [...options]
      delete payloadOptions[5].conditional
      if (someOneElse) payloadOptions[5].text = someOneElse
      const actorArray = Array.isArray(actor) ? actor : [actor]
      const actorNumbers: number[] = actorArray.map((item: string | number): number => Number(item))
      const mappedActor: Array<any> = payloadOptions.filter(option => actorNumbers.includes(option.value))
      const payload = { description: stepName, actor: mappedActor } as NewStep
      await this.stepService.saveSteps([payload], currentGoal)
      res.redirect(URLs.CREATE_STEP)
    } catch (e) {
      next(e)
    }
  }
}
