import { NextFunction, Request, Response } from 'express'
import locale from './locale.json'
import URLs from '../URLs'
import ReferentialDataService from '../../services/sentence-plan/referentialDataService'
import { formatDateWithStyle } from '../../utils/utils'
import { Goal, GoalStatus } from '../../@types/GoalType'
import transformRequest from '../../middleware/transformMiddleware'
import ChangeGoalPostModel from './models/ChangeGoalPostModel'
import validateRequest from '../../middleware/validationMiddleware'
import { PlanAgreementStatus } from '../../@types/PlanType'
import { requireAccessMode } from '../../middleware/authorisationMiddleware'
import { AccessMode } from '../../@types/Handover'
import { HttpError } from '../../utils/HttpError'
import { getDateOptions, getGoalTargetDate } from '../../utils/goalTargetDateUtils'
import { NewGoal } from '../../@types/NewGoalType'
import { areaConfigs } from '../../utils/assessmentAreaConfig.json'
import { AssessmentAreaConfig } from '../../@types/Assessment'
import { getAssessmentDetailsForArea } from '../../utils/assessmentUtils'

export default class ChangeGoalController {
  constructor(private readonly referentialDataService: ReferentialDataService) {}

  private render = async (req: Request, res: Response, next: NextFunction) => {
    const { uuid } = req.params
    const { errors } = req

    const sortedAreasOfNeed = this.referentialDataService.getSortedAreasOfNeed()
    const returnLink =
      req.services.sessionService.getReturnLink() === `/change-goal/${uuid}/`
        ? URLs.PLAN_OVERVIEW
        : req.services.sessionService.getReturnLink()
    const dateOptions = getDateOptions()
    const minimumDatePickerDate = formatDateWithStyle(new Date().toISOString(), 'short')

    try {
      const goal = await req.services.goalService.getGoal(uuid)
      const selectedAreaOfNeed = sortedAreasOfNeed.find(areaOfNeed => areaOfNeed.name === goal.areaOfNeed.name)
      const form = errors ? req.body : this.mapGoalToForm(goal)

      const criminogenicNeedsData = req.services.sessionService.getCriminogenicNeeds()
      const planUuid = req.services.sessionService.getPlanUUID()
      const plan = await req.services.planService.getPlanByUuid(planUuid)

      let assessmentDetailsForArea = null

      // get assessment data
      try {
        const assessmentResponse = await req.services.assessmentService.getAssessmentByUuid(planUuid)
        const assessmentData = assessmentResponse.sanAssessmentData

        // 2. get the assessment details for the selected area of need
        const areaConfig: AssessmentAreaConfig = areaConfigs.find(config => config.area === goal.areaOfNeed.name)
        assessmentDetailsForArea = getAssessmentDetailsForArea(criminogenicNeedsData, areaConfig, assessmentData)
      } catch {
        /* swallow the error, missing data is handled in the template */
      }

      return res.render('pages/change-goal', {
        locale: locale.en,
        data: {
          planAgreementStatus: plan.agreementStatus,
          minimumDatePickerDate,
          sortedAreasOfNeed,
          selectedAreaOfNeed,
          dateOptions,
          assessmentDetailsForArea,
          returnLink,
          form,
        },
        errors,
      })
    } catch (e) {
      return next(HttpError(500, e.message))
    }
  }

  private saveAndRedirect = async (req: Request, res: Response, next: NextFunction) => {
    const goalUuid = req.params.uuid
    const processedData: Partial<NewGoal> = this.processGoalData(req.body)

    const type = processedData.targetDate === null ? 'future' : 'current'

    try {
      await req.services.goalService.replaceGoal(processedData, goalUuid)

      let redirectTarget = `${URLs.PLAN_OVERVIEW}?status=changed&type=${type}`

      const planUuid = req.services.sessionService.getPlanUUID()
      const plan = await req.services.planService.getPlanByUuid(planUuid)

      // Check if the user has came back from the add-goals page
      if (req.services.sessionService.getReturnLink() === `/change-goal/${goalUuid}/`) {
        redirectTarget = `/goal/${goalUuid}/add-steps`
      }
      if (plan.agreementStatus === PlanAgreementStatus.AGREED) {
        redirectTarget = `/update-goal-steps/${goalUuid}`

        if (type === 'current') {
          const goal = await req.services.goalService.getGoal(goalUuid)
          if (goal.steps.length === 0) {
            redirectTarget = `/goal/${goalUuid}/add-steps`
          }
        }
      }

      return res.redirect(redirectTarget)
    } catch (e) {
      return next(HttpError(500, e.message))
    }
  }

  private mapGoalToForm = (goal: Goal) => {
    let isCustomTargetDate = false
    let formattedTargetDate

    if (goal.targetDate) {
      isCustomTargetDate = !getDateOptions().some(
        dateOption => dateOption.toISOString().substring(0, 10) === goal.targetDate.substring(0, 10),
      )

      if (isCustomTargetDate) {
        formattedTargetDate = formatDateWithStyle(goal.targetDate, 'short')
      } else {
        formattedTargetDate = goal.targetDate.substring(0, 10)
      }
    }

    return {
      'goal-input-autocomplete': goal.title,
      'area-of-need': goal.areaOfNeed.name,
      'related-area-of-need-radio': goal.relatedAreasOfNeed.length ? 'yes' : 'no',
      'related-area-of-need': goal.relatedAreasOfNeed.map(areaOfNeed => areaOfNeed.name),
      'start-working-goal-radio': goal.targetDate ? 'yes' : 'no',
      'date-selection-radio': isCustomTargetDate ? 'custom' : formattedTargetDate,
      'date-selection-custom': isCustomTargetDate ? formattedTargetDate : undefined,
    }
  }

  private processGoalData(body: any): Partial<NewGoal> {
    const title = body['goal-input-autocomplete']
    const targetDate = getGoalTargetDate(
      body['start-working-goal-radio'],
      body['date-selection-radio'],
      body['date-selection-custom'],
    )
    const areaOfNeed = body['area-of-need']
    const relatedAreasOfNeed = body['related-area-of-need-radio'] === 'yes' ? body['related-area-of-need'] : undefined
    const status = targetDate === null ? GoalStatus.FUTURE : undefined

    return {
      title,
      areaOfNeed,
      targetDate,
      relatedAreasOfNeed,
      status,
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
      body: ChangeGoalPostModel,
    }),
    validateRequest(),
    this.handleValidationErrors,
    this.saveAndRedirect,
  ]
}
