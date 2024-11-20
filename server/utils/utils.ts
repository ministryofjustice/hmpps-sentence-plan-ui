import { DateTime } from 'luxon'
// eslint-disable-next-line import/no-extraneous-dependencies
import camelCase from 'camelcase'
import { Person } from '../@types/Person'
import { RoshData } from '../@types/Rosh'
import { NewStep, StepStatus } from '../@types/StepType'
import { GoalStatus } from '../@types/GoalType'
import {
  AssessmentArea,
  AssessmentAreaConfig,
  AssessmentAreas,
  AssessmentResponse,
  CriminogenicNeedsData,
} from '../@types/Assessment'

const properCase = (word: string): string =>
  word.length >= 1 ? word[0].toUpperCase() + word.toLowerCase().slice(1) : word

const isBlank = (str: string): boolean => !str || /^\s*$/.test(str)

/**
 * Converts a name (first name, last name, middle name, etc.) to proper case equivalent, handling double-barreled names
 * correctly (i.e. each part in a double-barreled is converted to proper case).
 * @param name name to be converted.
 * @returns name converted to proper case.
 */
const properCaseName = (name: string): string => (isBlank(name) ? '' : name.split('-').map(properCase).join('-'))

export const convertToTitleCase = (sentence: string): string =>
  isBlank(sentence) ? '' : sentence.split(' ').map(properCaseName).join(' ')

export const initialiseName = (fullName?: string): string | null => {
  // this check is for the authError page
  if (!fullName) return null

  const array = fullName.split(' ')
  return `${array[0][0]}. ${array.reverse()[0]}`
}

export const toKebabCase = (string: string) =>
  isBlank(string) ? '' : string.trim().replace(/ /g, '-').toLowerCase().replace(',', '')

export function formatRoSHData(data: RoshData) {
  const { overallRisk, assessedOn, riskInCommunity } = data
  if ([overallRisk, assessedOn, riskInCommunity].includes(undefined)) {
    return { hasBeenCompleted: false }
  }
  return {
    hasBeenCompleted: true,
    riskInCommunity,
    lastUpdated: formatDate(assessedOn),
  }
}

export function formatPOPData(data: Person): Person {
  return { ...data, doB: formatDate(data.doB) }
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export const formatAssessmentData = (
  crimNeeds: CriminogenicNeedsData,
  assessment: AssessmentResponse,
  areas: AssessmentAreaConfig[],
): AssessmentAreas => {
  if (!assessment || !assessment.sanAssessmentData) {
    return { lowScoring: [], highScoring: [], other: [] }
  }
  const all = Object.values(areas)
    .map(area => {
      let score
      let linkedtoRoSH
      let linkedtoReoffending

      if (Object.prototype.hasOwnProperty.call(crimNeeds, area.crimNeedsKey)) {
        score = crimNeeds[area.crimNeedsKey][`${area.crimNeedsSubKey}OtherWeightedScore`]
        linkedtoRoSH = crimNeeds[area.crimNeedsKey][`${area.crimNeedsSubKey}LinkedToHarm`] === 'YES'
        linkedtoReoffending = crimNeeds[area.crimNeedsKey][`${area.crimNeedsSubKey}LinkedToReoffending`] === 'YES'
        if (Number.isNaN(Number(score))) {
          score = undefined
        } else if (score > area.upperBound) {
          score = area.upperBound
        }
      }
      const motivationToMakeChanges = motivationText(
        assessment.sanAssessmentData[`${area.assessmentKey}_changes`]?.value,
      )
      const riskOfSeriousHarm =
        assessment.sanAssessmentData[`${area.assessmentKey}_practitioner_analysis_risk_of_serious_harm_yes_details`]
          ?.value
      const riskOfReoffending =
        assessment.sanAssessmentData[`${area.assessmentKey}_practitioner_analysis_risk_of_reoffending_yes_details`]
          ?.value
      const strengthsOrProtectiveFactors =
        assessment.sanAssessmentData[
          `${area.assessmentKey}_practitioner_analysis_strengths_or_protective_factors_yes_details`
        ]?.value

      return {
        title: area.area,
        linkedtoRoSH,
        linkedtoReoffending,
        motivationToMakeChanges,
        riskOfSeriousHarm,
        riskOfReoffending,
        strengthsOrProtectiveFactors,
        criminogenicNeedsScore: score,
        goalRoute: area.goalRoute,
        upperBound: area.upperBound,
      } as AssessmentArea
    })
    .sort((a, b) => 0 - (a.criminogenicNeedsScore > b.criminogenicNeedsScore ? 1 : -1))

  const lowScoring = all.filter(area => Number(area.criminogenicNeedsScore) <= 3)
  const highScoring = all.filter(area => Number(area.criminogenicNeedsScore) > 3)
  const other = all.filter(area => area.criminogenicNeedsScore === undefined)
  return { lowScoring, highScoring, other, versionUpdatedAt: assessment.lastUpdatedTimestampSAN } as AssessmentAreas
}

export const motivationText = (optionResult?: string): string => {
  if (optionResult === undefined || optionResult === null) {
    return undefined
  }
  return camelCase(optionResult)
}

export const dateWithYear = (datetimeString: string): string | null => {
  if (!datetimeString || isBlank(datetimeString)) return undefined
  return DateTime.fromISO(datetimeString).toFormat('d MMMM yyyy')
}

export const yearsAndDaysElapsed = (datetimeStringFrom: string, datetimeStringTo: string): string => {
  if (!datetimeStringFrom || isBlank(datetimeStringFrom)) return undefined
  if (!datetimeStringTo || isBlank(datetimeStringTo)) return undefined
  const yearsDays = DateTime.fromISO(datetimeStringTo).diff(DateTime.fromISO(datetimeStringFrom), ['years', 'days'])

  return `(${yearsDays.years} years and ${yearsDays.days} days)`
}

export function formatDateWithStyle(isoDate: string, style: 'short' | 'full' | 'long' | 'medium' = 'long'): string {
  return new Date(isoDate).toLocaleDateString('en-gb', { dateStyle: style })
}

export function dateToISOFormat(date: string): string {
  if (date != null && date.indexOf('/') > -1) {
    const [day, month, year] = date.split('/')
    return [year, padToTwoDigits(month), padToTwoDigits(day)].join('-')
  }
  return date
}

function padToTwoDigits(value: string): string {
  return String(value).padStart(2, '0')
}

export function moveGoal(goals: Array<any>, gUuid: string, operation: string) {
  const orderedGoals = [...goals]
  const index = orderedGoals.findIndex(goal => goal.uuid === gUuid)

  if (index === -1 || (operation !== 'up' && operation !== 'down')) {
    return orderedGoals
  }
  const valueSetter = {
    up: (i: number) => i - 1,
    down: (i: number) => i + 1,
  }

  const targetGoalOrder = valueSetter[operation](orderedGoals[index].goalOrder)
  if (targetGoalOrder > 0) {
    const indexOfTargetGoalOrder = orderedGoals.findIndex(goal => goal.goalOrder === targetGoalOrder)
    if (indexOfTargetGoalOrder > -1) {
      orderedGoals[indexOfTargetGoalOrder].goalOrder = orderedGoals[index].goalOrder
    }

    orderedGoals[index].goalOrder = targetGoalOrder
  }
  return orderedGoals.map(({ uuid: goalUuid, goalOrder }) => ({ goalUuid, goalOrder }))
}

export function getAchieveDateOptions(date: Date, dateOptionsInMonths = [3, 6, 12]) {
  return dateOptionsInMonths.map(option => {
    const achieveDate = new Date(date)
    achieveDate.setMonth(date.getMonth() + option)
    return achieveDate
  })
}

export function mergeDeep(...objects: Record<string, any>[]): Record<string, any> {
  const isObject = (obj: any) => obj && typeof obj === 'object'

  return objects.reduce((prev, obj) => {
    if (!isObject(obj)) {
      return prev
    }

    const newObj: Record<string, any> = { ...prev }

    Object.keys(obj).forEach(key => {
      const pVal = prev[key]
      const oVal = obj[key]

      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        newObj[key] = pVal.concat(...oVal)
      } else if (isObject(pVal) && isObject(oVal)) {
        newObj[key] = mergeDeep(pVal, oVal)
      } else {
        newObj[key] = oVal
      }
    })

    return newObj
  }, {})
}

/*
  Depending on status, steps should be sorted by status, with the ones that have been updated being moved to the bottom of that sorted section.
  The expected status order top to bottom is:
  NOT_STARTED, IN_PROGRESS, CANNOT_BE_DONE_YET, NO_LONGER_NEEDED, COMPLETED

  If multiple are moved from e.g. not started --> in progress, they should stay in the same order.
  So if you agree a plan, lets say 3 steps in a goal, all are not started to begin with.
  step 1 and 3 get moved to in progress, they should then show:
    1. step 2 (not started)
    2. step 1 (in progress)
    3. step 3 (in progress).
 */
export function sortSteps(steps: NewStep[]) {
  const statusArray = Object.values(StepStatus)

  steps.sort((a, b) => {
    return statusArray.indexOf(a.status) - statusArray.indexOf(b.status) || a.updated - b.updated
  })
}

export function goalStatusToTabName(status: GoalStatus): string {
  return status === GoalStatus.ACTIVE ? 'current' : status.toLowerCase()
}
