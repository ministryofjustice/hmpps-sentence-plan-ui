// eslint-disable-next-line import/no-extraneous-dependencies
import camelCase from 'camelcase'
import { DateTime } from 'luxon'
import { isBlank } from './utils'
import {
  AnswerDTOs,
  AssessmentArea,
  AssessmentAreaConfig,
  AssessmentResponse,
  CriminogenicNeedsData,
  FormattedAssessment,
  SubAreaData,
} from '../@types/Assessment'
import getAssessmentAreaThreshold from '../services/sentence-plan/assessmentAreaThresholds'

export function getAssessmentDetailsForArea(
  crimNeeds: CriminogenicNeedsData,
  areaConfig: AssessmentAreaConfig,
  sanAssessmentData: AnswerDTOs,
) {
  const score = crimNeeds[areaConfig.crimNeedsKey][`${areaConfig.crimNeedsSubKey}OtherWeightedScore`]

  let isAssessmentSectionComplete: boolean

  // The Finance and Health and Wellbeing sections never have a score so do not use that when calculating if complete
  if (['Finances', 'Health and wellbeing'].includes(areaConfig.area)) {
    isAssessmentSectionComplete = sanAssessmentData[`${areaConfig.assessmentKey}_section_complete`]?.value === 'YES'
  } else {
    isAssessmentSectionComplete =
      sanAssessmentData[`${areaConfig.assessmentKey}_section_complete`]?.value === 'YES' && score !== undefined
  }

  // Values can be 'YES', 'NO' or 'NULL'
  const linkedToHarm = crimNeeds[areaConfig.crimNeedsKey][`${areaConfig.crimNeedsSubKey}LinkedToHarm`] ?? 'NULL'

  const linkedtoReoffending =
    crimNeeds[areaConfig.crimNeedsKey][`${areaConfig.crimNeedsSubKey}LinkedToReoffending`] ?? 'NULL'

  const linkedtoStrengthsOrProtectiveFactors =
    crimNeeds[areaConfig.crimNeedsKey][`${areaConfig.crimNeedsSubKey}Strengths`] ?? 'NULL'

  const riskOfSeriousHarmDetails =
    linkedToHarm !== 'NULL'
      ? sanAssessmentData[
          `${areaConfig.assessmentKey}_practitioner_analysis_risk_of_serious_harm_${linkedToHarm.toLowerCase()}_details`
        ]?.value
      : undefined

  const riskOfReoffendingDetails =
    linkedtoReoffending !== 'NULL'
      ? sanAssessmentData[
          `${areaConfig.assessmentKey}_practitioner_analysis_risk_of_reoffending_${linkedtoReoffending.toLowerCase()}_details`
        ]?.value
      : undefined

  const motivationToMakeChanges = motivationText(sanAssessmentData[`${areaConfig.assessmentKey}_changes`]?.value)

  const strengthsOrProtectiveFactorsDetails =
    linkedtoStrengthsOrProtectiveFactors !== 'NULL'
      ? sanAssessmentData[
          `${areaConfig.assessmentKey}_practitioner_analysis_strengths_or_protective_factors_${linkedtoStrengthsOrProtectiveFactors.toLowerCase()}_details`
        ]?.value
      : undefined

  const isAssessmentSectionNotStarted =
    isAssessmentSectionComplete === false &&
    linkedToHarm === 'NULL' &&
    linkedtoReoffending === 'NULL' &&
    linkedtoStrengthsOrProtectiveFactors === 'NULL' &&
    motivationToMakeChanges === undefined

  return {
    isAssessmentSectionNotStarted,
    isAssessmentSectionComplete,
    linkedToHarm,
    linkedtoReoffending,
    linkedtoStrengthsOrProtectiveFactors,
    riskOfSeriousHarmDetails,
    riskOfReoffendingDetails,
    motivationToMakeChanges,
    strengthsOrProtectiveFactorsDetails,
  }
}

export const formatAssessmentData = (
  crimNeeds: CriminogenicNeedsData,
  assessment: AssessmentResponse,
  areaConfigs: AssessmentAreaConfig[],
): FormattedAssessment => {
  if (!assessment || !assessment.sanAssessmentData) {
    return {
      isAssessmentComplete: false,
      areas: { incompleteAreas: [], highScoring: [], lowScoring: [], other: [] },
    }
  }

  const all = areaConfigs
    .filter(areaConfig => areaConfig.crimNeedsKey in crimNeeds && crimNeeds[areaConfig.crimNeedsKey])
    .map(areaConfig => {
      let score
      let subData: SubAreaData
      let overallScore

      // score in the fullCrimNeeds can be "N/A" or a number
      score = crimNeeds[areaConfig.crimNeedsKey][`${areaConfig.crimNeedsSubKey}OtherWeightedScore`]

      const {
        isAssessmentSectionNotStarted,
        isAssessmentSectionComplete,
        linkedToHarm,
        linkedtoReoffending,
        linkedtoStrengthsOrProtectiveFactors,
        riskOfSeriousHarmDetails,
        riskOfReoffendingDetails,
        motivationToMakeChanges,
        strengthsOrProtectiveFactorsDetails,
      } = getAssessmentDetailsForArea(crimNeeds, areaConfig, assessment.sanAssessmentData)

      if (Number.isNaN(Number(score))) {
        score = undefined
      } else if (score > areaConfig.upperBound) {
        score = areaConfig.upperBound
      }

      if (
        crimNeeds.lifestyleAndAssociates &&
        crimNeeds.thinkingBehaviourAndAttitudes &&
        areaConfig.crimNeedsKey === 'thinkingBehaviourAndAttitudes'
      ) {
        subData = {
          upperBound: '6',
          thresholdValue: getAssessmentAreaThreshold('lifestyleAndAssociates'),
          criminogenicNeedsScore: crimNeeds.lifestyleAndAssociates.lifestyleOtherWeightedScore,
        }
        overallScore = Math.max(
          Number(crimNeeds.thinkingBehaviourAndAttitudes.thinkOtherWeightedScore),
          Number(subData.criminogenicNeedsScore),
        )
      }

      return {
        title: areaConfig.area,
        overallScore: overallScore ?? score,
        linkedToHarm,
        linkedtoReoffending,
        linkedtoStrengthsOrProtectiveFactors,
        isAssessmentSectionNotStarted,
        isAssessmentSectionComplete,
        motivationToMakeChanges,
        riskOfSeriousHarmDetails,
        riskOfReoffendingDetails,
        strengthsOrProtectiveFactorsDetails,
        criminogenicNeedsScore: score,
        goalRoute: areaConfig.goalRoute,
        upperBound: areaConfig.upperBound,
        thresholdValue: getAssessmentAreaThreshold(areaConfig.crimNeedsKey),
        subData,
      } as AssessmentArea
    })

  let assessmentIsComplete = false

  // if none of the areas have missing information, mark the assessment as complete
  if (all.every(area => area.isAssessmentSectionComplete === true)) {
    assessmentIsComplete = true
  }

  let incompleteAreas: AssessmentArea[] = []

  if (!assessmentIsComplete) {
    incompleteAreas = all
      .filter(area => area.isAssessmentSectionComplete === false)
      .sort((a, b) => a.title.localeCompare(b.title))
  }

  const completeAreas = all.filter(area => area.isAssessmentSectionComplete === true)

  const highScoring = groupAndSortByRisk(completeAreas.filter(area => Number(area.overallScore) > area.thresholdValue))
  const lowScoring = groupAndSortByRisk(completeAreas.filter(area => Number(area.overallScore) <= area.thresholdValue))
  const otherUnsorted = groupAndSortByRisk(completeAreas.filter(area => area.criminogenicNeedsScore === undefined))

  // emptyAreas are areas that are missing from the criminogenic needs data
  const emptyAreas = groupAndSortMissingAreas(areaConfigs, crimNeeds)

  const other = groupAndSortByRisk(otherUnsorted).concat(emptyAreas)
  return {
    isAssessmentComplete: assessmentIsComplete,
    versionUpdatedAt: assessment.lastUpdatedTimestampSAN,
    areas: {
      incompleteAreas,
      highScoring,
      lowScoring,
      other,
    },
  } as FormattedAssessment
}

// 1. Invert the order of the groups of AssessmentArea score rankings (highest first)
// 2. For each group of areas, sort them by the distance between their overall score and the threshold value.
// 3. If the distances are equal, sort alphabetically by title
function sortByScoreAndTitle(groupedByRiskCount: Record<number, AssessmentArea[]>) {
  return Object.keys(groupedByRiskCount)
    .sort((a, b) => Number(b) - Number(a))
    .map(key =>
      groupedByRiskCount[Number(key)].sort((a, b) => {
        const distanceA = Number(a.overallScore) - a.thresholdValue
        const distanceB = Number(b.overallScore) - b.thresholdValue
        // if the distance from thresholds are the same or if we are missing the scores, we should sort alphabetically
        if (distanceA === distanceB || Number.isNaN(distanceA) || Number.isNaN(distanceB)) {
          return a.title.localeCompare(b.title)
        }
        return distanceA > distanceB ? -1 : 1
      }),
    )
    .reduce((acc, val) => acc.concat(val), [])
}

export const groupAndSortByRisk = (other: AssessmentArea[]): AssessmentArea[] => {
  const groupedByRiskCount: Record<number, AssessmentArea[]> = {}

  // group the areas by the sum of their risk counts, RoSH first
  other.forEach(area => {
    const riskCount = (area.linkedToHarm === 'YES' ? 2 : 0) + (area.linkedtoReoffending === 'YES' ? 1 : 0)
    if (!groupedByRiskCount[riskCount]) {
      groupedByRiskCount[riskCount] = []
    }
    groupedByRiskCount[riskCount].push(area)
  })

  return sortByScoreAndTitle(groupedByRiskCount)
}

// This function is used to group and sort the areas that are missing from the criminogenic needs data
// providing the minimum needed information to display them in the UI
function groupAndSortMissingAreas(areas: AssessmentAreaConfig[], crimNeeds: CriminogenicNeedsData) {
  return areas
    .reduce((acc, area) => {
      if (!(area.crimNeedsKey in crimNeeds && crimNeeds[area.crimNeedsKey])) {
        acc.push({
          title: area.area,
          goalRoute: area.goalRoute,
          criminogenicNeedMissing: true,
        } as AssessmentArea)
      }
      return acc
    }, [] as AssessmentArea[])
    .sort((a, b) => a.title.localeCompare(b.title))
}

export const motivationText = (optionResult?: string): string => {
  if (optionResult === undefined || optionResult === null) {
    return undefined
  }
  return camelCase(optionResult)
}

export const yearsAndDaysElapsed = (datetimeStringFrom: string, datetimeStringTo: string): any => {
  return DateTime.fromISO(datetimeStringTo).diff(DateTime.fromISO(datetimeStringFrom), ['years', 'months', 'days'])
}

const pluralise = (count: number, noun: string, suffix = 's'): string => {
  return `${count} ${noun}${count !== 1 ? suffix : ''}`
}

// The sentence duration returned is in the form "x years, y months and z days" where any of year,month,date can
// be 0, in which case it shouldn't be displayed and the formatting of the layout is updated accordingly.
export const sentenceLength = (datetimeStringFrom: string, datetimeStringTo: string, locale: any): any => {
  if (!datetimeStringFrom || isBlank(datetimeStringFrom)) return undefined
  if (!datetimeStringTo || isBlank(datetimeStringTo)) return undefined

  const yearsMonthsDays = yearsAndDaysElapsed(datetimeStringFrom, datetimeStringTo)
  let sentenceLengthstring = ''

  if (yearsMonthsDays.years > 0 && yearsMonthsDays.months > 0 && yearsMonthsDays.days > 0) {
    sentenceLengthstring = `${pluralise(yearsMonthsDays.years, locale.year)}, ${pluralise(yearsMonthsDays.months, locale.month)} and ${pluralise(yearsMonthsDays.days, locale.day)}`
  } else if (yearsMonthsDays.years > 0 && yearsMonthsDays.months > 0) {
    sentenceLengthstring = `${pluralise(yearsMonthsDays.years, locale.year)} ${locale.conjunction} ${pluralise(yearsMonthsDays.months, locale.month)}`
  } else if (yearsMonthsDays.months > 0 && yearsMonthsDays.days > 0) {
    sentenceLengthstring = `${pluralise(yearsMonthsDays.months, locale.month)} ${locale.conjunction} ${pluralise(yearsMonthsDays.days, locale.day)}`
  } else if (yearsMonthsDays.years > 0 && yearsMonthsDays.days > 0) {
    sentenceLengthstring = `${pluralise(yearsMonthsDays.years, locale.year)} ${locale.conjunction} ${pluralise(yearsMonthsDays.days, locale.day)}`
  } else if (yearsMonthsDays.years > 0) {
    sentenceLengthstring = `${pluralise(yearsMonthsDays.years, locale.year)}`
  } else if (yearsMonthsDays.months > 0) {
    sentenceLengthstring = `${pluralise(yearsMonthsDays.months, locale.month)}`
  } else if (yearsMonthsDays.days > 0) {
    sentenceLengthstring = `${pluralise(yearsMonthsDays.days, locale.day)}`
  }

  return `(${sentenceLengthstring})`
}
