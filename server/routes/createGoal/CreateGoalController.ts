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
import { HttpError } from '../../utils/HttpError'
import { getDateOptions, getGoalTargetDate } from '../../utils/goalTargetDateUtils'
import { areaConfigs } from '../../utils/assessmentAreaConfig.json'
import { AssessmentAreaConfig } from '../../@types/Assessment'
import { getAssessmentDetailsForArea } from '../../utils/assessmentUtils'
import { AuditEvent } from '../../services/auditService'
import { AccessMode } from '../../@types/SessionType'

export default class CreateGoalController {
  constructor(private readonly referentialDataService: ReferentialDataService) {}

  private saveAndRedirect = async (req: Request, res: Response, next: NextFunction) => {
    const processedData: NewGoal = this.processGoalData(req.body)
    const type: string = processedData.targetDate == null ? 'future' : 'current'
    const planUuid = req.services.sessionService.getPlanUUID()

    try {
      const { uuid } = await req.services.goalService.saveGoal(processedData, planUuid)

      req.services.sessionService.setReturnLink(`/change-goal/${uuid}/`)

      await req.services.auditService.send(AuditEvent.CREATE_A_GOAL, { goalUUID: uuid })

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

      // get assessment data or swallow the service error and set to null so the template knows this data is missing
      const assessmentDetailsForArea = await req.services.assessmentService
        .getAssessmentByUuid(planUuid)
        .then(assessmentResponse => {
          const assessmentData = assessmentResponse.sanAssessmentData
          const areaConfig: AssessmentAreaConfig = areaConfigs.find(config => config.area === selectedAreaOfNeed?.name)
          return getAssessmentDetailsForArea(criminogenicNeedsData, areaConfig, assessmentData)
        })
        .catch((): null => null)

      const currentReturnLink = req.services.sessionService.getReturnLink()
      const newReturnLink = currentReturnLink === '/about' ? currentReturnLink : `/plan?type=${type}`

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
          returnLink: newReturnLink,
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
