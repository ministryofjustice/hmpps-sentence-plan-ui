// eslint-disable-next-line import/no-extraneous-dependencies
import camelCase from 'camelcase'
import { DateTime } from 'luxon'
import { isBlank } from './utils'
import {
  AnswerDTOs,
  AssessmentArea,
  AssessmentAreaConfig,
  AssessmentResponse,
  FormattedAssessment,
  SubAreaData,
} from '../@types/Assessment'
import { assessmentAreaThresholds } from '../services/sentence-plan/assessmentAreaThresholds'
import { CriminogenicNeedScore, Section } from '../@types/CriminogenicNeedsType'

export function getAssessmentDetailsForArea(
  crimNeeds: CriminogenicNeedScore[],
  areaConfig: AssessmentAreaConfig,
  sanAssessmentData: AnswerDTOs,
) {
  const { score } = crimNeeds.find(it => it.section === areaConfig.crimNeedSection) ?? { score: null }

  const isSanSectionComplete = sanAssessmentData[`${areaConfig.assessmentKey}_section_complete`]?.value === 'YES'

  // The Finance and Health and Wellbeing sections never have a score so do not use that when calculating if complete
  const isAssessmentSectionComplete =
    areaConfig.crimNeedSection === null ? isSanSectionComplete : isSanSectionComplete && score !== null

  // Values can be 'YES', 'NO' or 'NULL'
  const linkedToHarm =
    sanAssessmentData[`${areaConfig.assessmentKey}_practitioner_analysis_risk_of_serious_harm`]?.value ?? 'NULL'

  const linkedtoReoffending =
    sanAssessmentData[`${areaConfig.assessmentKey}_practitioner_analysis_risk_of_reoffending`]?.value ?? 'NULL'

  const linkedtoStrengthsOrProtectiveFactors =
    sanAssessmentData[`${areaConfig.assessmentKey}_practitioner_analysis_strengths_or_protective_factors`]?.value ??
    'NULL'

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
  crimNeeds: CriminogenicNeedScore[],
  assessment: AssessmentResponse,
  areaConfigs: AssessmentAreaConfig[],
): FormattedAssessment => {
  if (!assessment || !assessment.sanAssessmentData) {
    return {
      isAssessmentComplete: false,
      areas: { incompleteAreas: [], highScoring: [], lowScoring: [], other: [] },
    }
  }

  const all = areaConfigs.map(areaConfig => {
    let subData: SubAreaData
    let overallScore
    let { score } = crimNeeds.find(it => it.section === areaConfig.crimNeedSection) ?? { score: null }

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

    if (score !== null && score > areaConfig.upperBound) {
      score = areaConfig.upperBound
    }

    if (
      crimNeeds.some(it => it.section === Section.LIFESTYLE_AND_ASSOCIATES) &&
      crimNeeds.some(it => it.section === Section.THINKING_AND_BEHAVIOUR) &&
      areaConfig.crimNeedSection === Section.THINKING_AND_BEHAVIOUR
    ) {
      subData = {
        upperBound: 6,
        thresholdValue: assessmentAreaThresholds[Section.LIFESTYLE_AND_ASSOCIATES],
        criminogenicNeedsScore: (
          crimNeeds.find(it => it.section === Section.LIFESTYLE_AND_ASSOCIATES) ?? { score: null }
        ).score,
      }
      overallScore = Math.max(Number(score), Number(subData.criminogenicNeedsScore))
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
      thresholdValue: assessmentAreaThresholds[areaConfig.crimNeedSection],
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
  const otherUnsorted = groupAndSortByRisk(completeAreas.filter(area => area.criminogenicNeedsScore === null))

  const other = groupAndSortByRisk(otherUnsorted)
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
