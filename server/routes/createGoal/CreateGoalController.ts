import { NextFunction, Request, Response } from 'express'
import ReferentialDataService from '../../services/sentence-plan/referentialDataService'
import locale from './locale.json'
import URLs from '../URLs'
import { FORMS } from '../../services/formStorageService'
import GoalService from '../../services/sentence-plan/goalService'
import { NewGoal } from '../../@types/NewGoalType'
import { formatDateWithStyle, dateToISOFormat, getAchieveDateOptions } from '../../utils/utils'

export default class CreateGoalController {
  constructor(
    private readonly referentialDataService: ReferentialDataService,
    private readonly goalService: GoalService,
  ) {}

  private saveAndRedirect = async (req: Request, res: Response, next: NextFunction) => {
    // TODO: Delete this saved form data when the new steps controller/logic is in
    req.services.formStorageService.saveFormData(FORMS.CREATE_GOAL, {
      processed: this.processGoalData(req.body),
      raw: req.body,
    })

    const processedData: NewGoal = this.processGoalData(req.body)
    const planUuid = req.services.sessionService.getPlanUUID()
    try {
      const { uuid } = await this.goalService.saveGoal(processedData, planUuid)

      // TODO: Delete this saved form data when the new steps controller/logic is in
      req.services.formStorageService.saveFormData('currentGoal', {
        processed: null,
        raw: { uuid },
      })

      if (req.body.action === 'addStep') {
        return res.redirect(URLs.CREATE_STEP)
      }
      return res.redirect(`${URLs.PLAN_SUMMARY}?status=success`)
    } catch (e) {
      return next(e)
    }
  }

  private render = async (req: Request, res: Response, next: NextFunction) => {
    const { errors } = req

    const areasOfNeed = this.referentialDataService.getAreasOfNeed()
    const popData = req.services.sessionService.getSubjectDetails()

    const dateOptions = this.getDateOptions()
    const selectedAreaOfNeed = areasOfNeed.find(areaOfNeed => areaOfNeed.url === req.params.areaOfNeed)
    const minimumDatePickerDate = formatDateWithStyle(new Date().toISOString(), 'short')

    return res.render('pages/create-goal', {
      locale: locale.en,
      data: {
        areasOfNeed,
        selectedAreaOfNeed,
        popData,
        dateOptions,
        minimumDatePickerDate,
        form: req.body,
      },
      errors,
    })
  }

  private processGoalData(body: any) {
    const title = body['goal-input-autocomplete']
    const targetDate =
      body['date-selection-radio'] === 'custom'
        ? dateToISOFormat(body['date-selection-custom'])
        : body['date-selection-radio']
    const areaOfNeed = body['area-of-need']
    const relatedAreasOfNeed = body['related-area-of-need-radio'] === 'yes' ? body['related-area-of-need'] : undefined

    return {
      title,
      areaOfNeed,
      targetDate,
      relatedAreasOfNeed,
    }
  }

  private getDateOptions = () => {
    const today = new Date()
    return [...getAchieveDateOptions(today), new Date(today.setDate(today.getDate() + 7))]
  }

  get = this.render

  post = (req: Request, res: Response, next: NextFunction) => {
    if (Object.keys(req.errors.body).length) {
      return this.render(req, res, next)
    }
    return this.saveAndRedirect(req, res, next)
  }
}
