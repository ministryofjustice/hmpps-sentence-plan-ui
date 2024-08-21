import { NextFunction, Request, Response } from 'express'
import locale from './locale.json'
import GoalService from '../../services/sentence-plan/goalService'
import URLs from '../URLs'
import ReferentialDataService from '../../services/sentence-plan/referentialDataService'
import { dateToISOFormat, formatDateWithStyle, getAchieveDateOptions } from '../../utils/utils'
import { NewGoal } from '../../@types/NewGoalType'
import { Goal } from '../../@types/GoalType'

export default class EditGoalController {
  constructor(
    private readonly referentialDataService: ReferentialDataService,
    private readonly goalService: GoalService,
  ) {}

  private render = async (req: Request, res: Response, next: NextFunction) => {
    const { uuid } = req.params
    const { errors } = req

    const sortedAreasOfNeed = this.referentialDataService.getSortedAreasOfNeed()
    const popData = req.services.sessionService.getSubjectDetails()
    const goal = await this.goalService.getGoal(uuid)

    const dateOptions = this.getDateOptions()
    const selectedAreaOfNeed = sortedAreasOfNeed.find(areaOfNeed => areaOfNeed.name === goal.areaOfNeed.name)
    const minimumDatePickerDate = formatDateWithStyle(new Date().toISOString(), 'short')
    const form = errors ? req.body : this.mapGoalToForm(goal)

    return res.render('pages/edit-goal', {
      locale: locale.en,
      data: {
        minimumDatePickerDate,
        sortedAreasOfNeed,
        selectedAreaOfNeed,
        popData,
        dateOptions,
        form,
      },
      errors,
    })
  }

  get = this.render

  post = (req: Request, res: Response, next: NextFunction) => {
    if (Object.keys(req.errors?.body).length) {
      return this.render(req, res, next)
    }
    return this.saveAndRedirect(req, res, next)
  }

  private saveAndRedirect = async (req: Request, res: Response, next: NextFunction) => {
    const goalUuid = req.params.uuid
    const processedData: NewGoal = this.processGoalData(req.body)

    const type = processedData.targetDate === null ? 'future' : 'current'

    try {
      await this.goalService.updateGoal(processedData, goalUuid)
      return res.redirect(`${URLs.PLAN_SUMMARY}?status=updated&type=${type}`)
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
      'other-area-of-need-radio': goal.relatedAreasOfNeed.length ? 'yes' : 'no',
      'other-area-of-need': goal.relatedAreasOfNeed.map(areaOfNeed => areaOfNeed.name),
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
    const relatedAreasOfNeed = body['other-area-of-need-radio'] === 'yes' ? body['other-area-of-need'] : undefined

    return {
      title,
      areaOfNeed,
      targetDate,
      relatedAreasOfNeed,
    }
  }
}
