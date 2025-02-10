import { NextFunction, Request, Response } from 'express'
import ReferentialDataService from '../../services/sentence-plan/referentialDataService'
import locale from './locale.json'

import URLs from '../URLs'
import { NewGoal } from '../../@types/NewGoalType'
import { formatDateWithStyle } from '../../utils/utils'
import transformRequest from '../../middleware/transformMiddleware'
import CreateGoalPostModel from './models/CreateGoalPostModel'
import validateRequest from '../../middleware/validationMiddleware'
import { requireAccessMode } from '../../middleware/authorisationMiddleware'
import { AccessMode } from '../../@types/Handover'
import { HttpError } from '../../utils/HttpError'
import { getDateOptions, getGoalTargetDate } from '../../utils/goalTargetDateUtils'
import { areaConfigs } from '../../utils/assessmentAreaConfig.json'
import { AssessmentAreaConfig } from '../../@types/Assessment'
import { getAssessmentDetailsForArea } from '../../utils/assessmentUtils'

export default class CreateGoalController {
  constructor(private readonly referentialDataService: ReferentialDataService) {}

  private saveAndRedirect = async (req: Request, res: Response, next: NextFunction) => {
    const processedData: NewGoal = this.processGoalData(req.body)
    const type: string = processedData.targetDate == null ? 'future' : 'current'
    const planUuid = req.services.sessionService.getPlanUUID()

    try {
      const { uuid } = await req.services.goalService.saveGoal(processedData, planUuid)

      req.services.sessionService.setReturnLink(`/change-goal/${uuid}/`)

      if (req.body.action === 'addStep') {
        return res.redirect(`${URLs.ADD_STEPS.replace(':uuid', uuid)}?type=${type}`)
      }

      return res.redirect(`${URLs.PLAN_OVERVIEW}?status=added&type=${type}`)
    } catch (e) {
      return next(HttpError(500, e.message))
    }
  }

  private render = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { errors } = req
      const type = req.query?.type ?? 'current'

      const areasOfNeed = this.referentialDataService.getAreasOfNeed()
      const sortedAreasOfNeed = this.referentialDataService.getSortedAreasOfNeed()

      const dateOptions = getDateOptions()
      const selectedAreaOfNeed = areasOfNeed.find(areaOfNeed => areaOfNeed.url === req.params.areaOfNeed)
      const minimumDatePickerDate = formatDateWithStyle(new Date().toISOString(), 'short')

      const criminogenicNeedsData = req.services.sessionService.getCriminogenicNeeds()
      const planUuid = req.services.sessionService.getPlanUUID()
      const plan = await req.services.planService.getPlanByUuid(planUuid)

      let assessmentDetailsForArea = null

      // get assessment data
      try {
        const assessmentResponse = await req.services.assessmentService.getAssessmentByUuid(planUuid)
        const assessmentData = assessmentResponse.sanAssessmentData

        // 2. get the assessment details for the selected area of need
        const areaConfig: AssessmentAreaConfig = areaConfigs.find(config => config.area === selectedAreaOfNeed?.name)
        assessmentDetailsForArea = getAssessmentDetailsForArea(criminogenicNeedsData, areaConfig, assessmentData)

        // todo: 5. move njk stuff to a component
        // todo: 6. write a cypress test for the view
        // todo: 7. think about what to do for test data variations
      } catch (e) {
        /* swallow the error, missing data is handled in the template */
      }

      /**
       * Assessment info states:
       * 1. [x] Assessment API failure - warning: assessmentUnavailable
       * 2. [x] Assessment is complete and all information is available - no warning
       * 3. [x] Assessment is not complete and all information is available - warning: assessmentIncomplete
       * 4. [x] Assessment is not complete and some information is available - warning: assessmentIncomplete
       * 5. [] Assessment is not complete and no information is available - warning: assessmentNotStarted
       */

      req.services.sessionService.setReturnLink(null)

      return res.render('pages/create-goal', {
        locale: locale.en,
        data: {
          planAgreementStatus: plan.agreementStatus,
          areasOfNeed,
          sortedAreasOfNeed,
          selectedAreaOfNeed,
          dateOptions,
          minimumDatePickerDate,
          assessmentDetailsForArea,
          returnLink: `/plan?type=${type}`,
          form: req.body,
        },
        errors,
      })
    } catch (e) {
      return next(HttpError(500, e.message))
    }
  }

  private processGoalData(body: any) {
    const title = body['goal-input-autocomplete']
    const targetDate = getGoalTargetDate(
      body['start-working-goal-radio'],
      body['date-selection-radio'],
      body['date-selection-custom'],
    )
    const areaOfNeed = body['area-of-need']
    const relatedAreasOfNeed = body['related-area-of-need-radio'] === 'yes' ? body['related-area-of-need'] : undefined

    return {
      title,
      areaOfNeed,
      targetDate,
      relatedAreasOfNeed,
    }
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
