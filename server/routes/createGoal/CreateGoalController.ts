import { NextFunction, Request, Response } from 'express'
import ReferentialDataService from '../../services/sentence-plan/referentialDataService'
import locale from './locale.json'
import URLs from '../URLs'
import { FORMS } from '../../services/formStorageService'
import { NewGoal } from '../../@types/NewGoalType'
import { dateToISOFormat, formatDateWithStyle, getAchieveDateOptions } from '../../utils/utils'
import transformRequest from '../../middleware/transformMiddleware'
import CreateGoalPostModel from './models/CreateGoalPostModel'
import validateRequest from '../../middleware/validationMiddleware'
import { requireAccessMode } from '../../middleware/authorisationMiddleware'
import { AccessMode } from '../../@types/Handover'

export default class CreateGoalController {
  constructor(private readonly referentialDataService: ReferentialDataService) {}

  private saveAndRedirect = async (req: Request, res: Response, next: NextFunction) => {
    // TODO: Delete this saved form data when the new steps controller/logic is in
    req.services.formStorageService.saveFormData(FORMS.CREATE_GOAL, {
      processed: this.processGoalData(req.body),
      raw: req.body,
    })

    const processedData: NewGoal = this.processGoalData(req.body)
    const type: string = processedData.targetDate == null ? 'future' : 'current'
    const planUuid = req.services.sessionService.getPlanUUID()
    try {
      const { uuid } = await req.services.goalService.saveGoal(processedData, planUuid)

      // TODO: Delete this saved form data when the new steps controller/logic is in
      req.services.formStorageService.saveFormData('currentGoal', {
        processed: null,
        raw: { uuid },
      })

      if (req.body.action === 'addStep') {
        return res.redirect(`${URLs.ADD_STEPS.replace(':uuid', uuid)}?type=${type}`)
      }
      return res.redirect(`${URLs.PLAN_OVERVIEW}?status=added&type=${type}`)
    } catch (e) {
      return next(e)
    }
  }

  private render = async (req: Request, res: Response, next: NextFunction) => {
    const { errors } = req
    const type = req.query?.type ?? 'current'

    const areasOfNeed = this.referentialDataService.getAreasOfNeed()
    const sortedAreasOfNeed = this.referentialDataService.getSortedAreasOfNeed()

    const dateOptions = this.getDateOptions()
    const selectedAreaOfNeed = areasOfNeed.find(areaOfNeed => areaOfNeed.url === req.params.areaOfNeed)
    const minimumDatePickerDate = formatDateWithStyle(new Date().toISOString(), 'short')

    req.services.sessionService.setReturnLink(null)

    return res.render('pages/create-goal', {
      locale: locale.en,
      data: {
        areasOfNeed,
        sortedAreasOfNeed,
        selectedAreaOfNeed,
        dateOptions,
        minimumDatePickerDate,
        returnLink: `/plan?type=${type}`,
        form: req.body,
      },
      errors,
    })
  }

  private processGoalData(body: any) {
    const title = body['goal-input-autocomplete']
    let targetDate =
      body['date-selection-radio'] === 'custom' && body['start-working-goal-radio'] === 'yes'
        ? dateToISOFormat(body['date-selection-custom'])
        : body['date-selection-radio']
    if (body['start-working-goal-radio'] === 'no') {
      targetDate = null
    }
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
    return getAchieveDateOptions(today)
  }

  private handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    if (Object.keys(req.errors.body).length) {
      return this.render(req, res, next)
    }
    return next()
  }

  get = [requireAccessMode(AccessMode.READ_WRITE), this.render]

  post = [
    requireAccessMode(AccessMode.READ_WRITE),
    transformRequest({
      body: CreateGoalPostModel,
    }),
    validateRequest(),
    this.handleValidationErrors,
    this.saveAndRedirect,
  ]
}
