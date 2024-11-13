import { NextFunction, Request, Response } from 'express'
import locale from './locale.json'
import URLs from '../URLs'
import ReferentialDataService from '../../services/sentence-plan/referentialDataService'
import { dateToISOFormat, formatDateWithStyle, getAchieveDateOptions } from '../../utils/utils'
import { NewGoal } from '../../@types/NewGoalType'
import { Goal, GoalStatus } from '../../@types/GoalType'
import transformRequest from '../../middleware/transformMiddleware'
import ChangeGoalPostModel from './models/ChangeGoalPostModel'
import validateRequest from '../../middleware/validationMiddleware'
import { PlanAgreementStatus } from '../../@types/PlanType'

export default class ChangeGoalController {
  constructor(private readonly referentialDataService: ReferentialDataService) {}

  private render = async (req: Request, res: Response, next: NextFunction) => {
    const { uuid } = req.params
    const { errors } = req

    const sortedAreasOfNeed = this.referentialDataService.getSortedAreasOfNeed()
    const goal = await req.services.goalService.getGoal(uuid)

    const dateOptions = this.getDateOptions()
    const selectedAreaOfNeed = sortedAreasOfNeed.find(areaOfNeed => areaOfNeed.name === goal.areaOfNeed.name)
    const minimumDatePickerDate = formatDateWithStyle(new Date().toISOString(), 'short')
    const form = errors ? req.body : this.mapGoalToForm(goal)

    return res.render('pages/change-goal', {
      locale: locale.en,
      data: {
        minimumDatePickerDate,
        sortedAreasOfNeed,
        selectedAreaOfNeed,
        dateOptions,
        form,
      },
      errors,
    })
  }

  private saveAndRedirect = async (req: Request, res: Response, next: NextFunction) => {
    const goalUuid = req.params.uuid
    const processedData: NewGoal = this.processGoalData(req.body)

    const type = processedData.targetDate === null ? 'future' : 'current'

    try {
      await req.services.goalService.updateGoal(processedData, goalUuid)

      let redirectTarget = `${URLs.PLAN_OVERVIEW}?status=updated&type=${type}`

      const planUuid = req.services.sessionService.getPlanUUID()
      const plan = await req.services.planService.getPlanByUuid(planUuid)

      if (plan.agreementStatus === PlanAgreementStatus.AGREED) {
        redirectTarget = `/update-goal/${goalUuid}`

        if (type === 'current') {
          const goal = await req.services.goalService.getGoal(goalUuid)
          if (goal.steps.length === 0) {
            redirectTarget = `/goal/${goalUuid}/add-steps`
          }
        }
      }

      return res.redirect(redirectTarget)
    } catch (e) {
      return next(e)
    }
  }

  private getDateOptions = () => {
    const today = new Date()
    return [...getAchieveDateOptions(today), new Date(today.setDate(today.getDate() + 7))]
  }

  private mapGoalToForm = (goal: Goal) => {
    let isCustomTargetDate = false
    let formattedTargetDate

    if (goal.targetDate) {
      isCustomTargetDate = !this.getDateOptions().some(
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

  private processGoalData(body: any) {
    const title = body['goal-input-autocomplete']
    const targetDate =
      // eslint-disable-next-line no-nested-ternary
      body['start-working-goal-radio'] === 'yes'
        ? body['date-selection-radio'] === 'custom'
          ? dateToISOFormat(body['date-selection-custom'])
          : body['date-selection-radio']
        : null
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

  get = this.render

  post = [
    transformRequest({
      body: ChangeGoalPostModel,
    }),
    validateRequest(),
    this.handleValidationErrors,
    this.saveAndRedirect,
  ]
}
