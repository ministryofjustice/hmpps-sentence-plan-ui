// eslint-disable-next-line import/no-extraneous-dependencies
import camelCase from 'camelcase'
import { DateTime } from 'luxon'
import { isBlank } from './utils'
import {
  AssessmentArea,
  AssessmentAreaConfig,
  AssessmentAreas,
  AssessmentResponse,
  CriminogenicNeedsData,
  SubAreaData,
} from '../@types/Assessment'
import getAssessmentAreaThreshold from '../services/sentence-plan/assessmentAreaThresholds'

export const formatAssessmentData = (
  crimNeeds: CriminogenicNeedsData,
  assessment: AssessmentResponse,
  areas: AssessmentAreaConfig[],
): AssessmentAreas => {
  if (!assessment || !assessment.sanAssessmentData) {
    return { lowScoring: [], highScoring: [], other: [] }
  }
  const all = Object.values(areas).map(area => {
    let score
    let linkedtoRoSH
    let linkedtoReoffending
    let subData: SubAreaData
    let overallScore

    if (area.crimNeedsKey in crimNeeds) {
      score = crimNeeds[area.crimNeedsKey][`${area.crimNeedsSubKey}OtherWeightedScore`]
      linkedtoRoSH = crimNeeds[area.crimNeedsKey][`${area.crimNeedsSubKey}LinkedToHarm`] === 'YES'
      linkedtoReoffending = crimNeeds[area.crimNeedsKey][`${area.crimNeedsSubKey}LinkedToReoffending`] === 'YES'
      if (Number.isNaN(Number(score))) {
        score = undefined
      } else if (score > area.upperBound) {
        score = area.upperBound
      }
    }

    if (
      crimNeeds.lifestyleAndAssociates &&
      crimNeeds.thinkingBehaviourAndAttitudes &&
      area.crimNeedsKey === 'thinkingBehaviourAndAttitudes'
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

    const motivationToMakeChanges = motivationText(assessment.sanAssessmentData[`${area.assessmentKey}_changes`]?.value)
    const riskOfSeriousHarmDetails =
      assessment.sanAssessmentData[`${area.assessmentKey}_practitioner_analysis_risk_of_serious_harm_yes_details`]
        ?.value
    const riskOfReoffendingDetails =
      assessment.sanAssessmentData[`${area.assessmentKey}_practitioner_analysis_risk_of_reoffending_yes_details`]?.value
    const strengthsOrProtectiveFactors =
      assessment.sanAssessmentData[
        `${area.assessmentKey}_practitioner_analysis_strengths_or_protective_factors_yes_details`
      ]?.value

    return {
      title: area.area,
      overallScore: overallScore ?? score,
      linkedtoRoSH,
      linkedtoReoffending,
      motivationToMakeChanges,
      riskOfSeriousHarmDetails,
      riskOfReoffendingDetails,
      strengthsOrProtectiveFactors,
      criminogenicNeedsScore: score,
      goalRoute: area.goalRoute,
      upperBound: area.upperBound,
      thresholdValue: getAssessmentAreaThreshold(area.crimNeedsKey),
      subData,
    } as AssessmentArea
  })

  const lowScoring = filterAndSortAreas(all, (score, threshold) => score <= threshold)
  const highScoring = filterAndSortAreas(all, (score, threshold) => score > threshold)
  const otherUnsorted = all.filter(area => area.criminogenicNeedsScore === undefined)
  const other = groupAndSortOtherAreas(otherUnsorted)
  return { lowScoring, highScoring, other, versionUpdatedAt: assessment.lastUpdatedTimestampSAN } as AssessmentAreas
}

const filterAndSortAreas = (areas: AssessmentArea[], comparator: (score: number, threshold: number) => boolean) => {
  return areas
    .filter(area => comparator(Number(area.overallScore), area.thresholdValue))
    .sort((a, b) => {
      const scoreDifference = Number(a.overallScore) - a.thresholdValue - (Number(b.overallScore) - b.thresholdValue)
      if (scoreDifference !== 0) {
        return scoreDifference > 0 ? -1 : 1
      }
      return a.title.localeCompare(b.title)
    })
}

export const groupAndSortOtherAreas = (other: AssessmentArea[]): AssessmentArea[] => {
  const groupedByRiskCount: Record<number, AssessmentArea[]> = {}

  // group the areas by the sum of their risk counts, RoSH first
  other.forEach(area => {
    const riskCount = (area.linkedtoRoSH ? 2 : 0) + (area.linkedtoReoffending ? 1 : 0)
    if (!groupedByRiskCount[riskCount]) {
      groupedByRiskCount[riskCount] = []
    }
    groupedByRiskCount[riskCount].push(area)
  })

  // invert the order of the keys and sort the areas by title
  return Object.keys(groupedByRiskCount)
    .sort((a, b) => Number(b) - Number(a))
    .map(key => groupedByRiskCount[Number(key)].sort((a, b) => a.title.localeCompare(b.title)))
    .reduce((acc, val) => acc.concat(val), [])
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

export const yearsAndDaysElapsed = (datetimeStringFrom: string, datetimeStringTo: string): any => {
  if (!datetimeStringFrom || isBlank(datetimeStringFrom)) return undefined
  if (!datetimeStringTo || isBlank(datetimeStringTo)) return undefined
  const yearsMonthsDays = DateTime.fromISO(datetimeStringTo).diff(DateTime.fromISO(datetimeStringFrom), [
    'years',
    'months',
    'days',
  ])

  return yearsMonthsDays
}

const pluralise = (count: number, noun: string, suffix = 's'): string => {
  return `${count} ${noun}${count !== 1 ? suffix : ''}`
}

// The sentence duration returned is in the form "x years, y months and z days" where any of year,month,date can
// be 0, in which case it shouldn't be displayed and the formatting of the layout is updated accordingly.
export const sentenceLength = (datetimeStringFrom: string, datetimeStringTo: string, locale: any): any => {
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

  return sentenceLengthstring
}
