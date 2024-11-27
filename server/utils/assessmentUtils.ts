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
    const riskOfSeriousHarm =
      assessment.sanAssessmentData[`${area.assessmentKey}_practitioner_analysis_risk_of_serious_harm_yes_details`]
        ?.value
    const riskOfReoffending =
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
      riskOfSeriousHarm,
      riskOfReoffending,
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
    const riskCount = (area.riskOfSeriousHarm === 'YES' ? 2 : 0) + (area.riskOfReoffending === 'YES' ? 1 : 0)
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

export const yearsAndDaysElapsed = (datetimeStringFrom: string, datetimeStringTo: string): string => {
  if (!datetimeStringFrom || isBlank(datetimeStringFrom)) return undefined
  if (!datetimeStringTo || isBlank(datetimeStringTo)) return undefined
  const yearsDays = DateTime.fromISO(datetimeStringTo).diff(DateTime.fromISO(datetimeStringFrom), ['years', 'days'])

  return `(${yearsDays.years} years and ${yearsDays.days} days)`
}
