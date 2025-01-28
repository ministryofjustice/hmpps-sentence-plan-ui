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
import logger from '../../logger'

export const formatAssessmentData = (
  crimNeeds: CriminogenicNeedsData,
  assessment: AssessmentResponse,
  areaConfigs: AssessmentAreaConfig[],
): AssessmentAreas => {
  if (!assessment || !assessment.sanAssessmentData) {
    return { lowScoring: [], highScoring: [], other: [] }
  }

  const all = areaConfigs
    .filter(areaConfig => areaConfig.crimNeedsKey in crimNeeds && crimNeeds[areaConfig.crimNeedsKey])
    .map(areaConfig => {
      let score

      // Values can be 'YES', 'NO' or 'NULL'
      const linkedToHarm = (
        crimNeeds[areaConfig.crimNeedsKey][`${areaConfig.crimNeedsSubKey}LinkedToHarm`] ?? 'NULL'
      ).toLowerCase()
      const linkedtoReoffending = (
        crimNeeds[areaConfig.crimNeedsKey][`${areaConfig.crimNeedsSubKey}LinkedToReoffending`] ?? 'NULL'
      ).toLowerCase()
      const linkedtoStrengthsOrProtectiveFactors = (
        crimNeeds[areaConfig.crimNeedsKey][`${areaConfig.crimNeedsSubKey}Strengths`] ?? 'NULL'
      ).toLowerCase()

      let subData: SubAreaData
      let overallScore
      const motivationToMakeChanges = motivationText(
        assessment.sanAssessmentData[`${areaConfig.assessmentKey}_changes`]?.value,
      )

      const riskOfSeriousHarmDetails =
        linkedToHarm !== 'null'
          ? assessment.sanAssessmentData[
              `${areaConfig.assessmentKey}_practitioner_analysis_risk_of_serious_harm_${linkedToHarm}_details`
            ]?.value
          : undefined

      const riskOfReoffendingDetails =
        linkedtoReoffending !== 'null'
          ? assessment.sanAssessmentData[
              `${areaConfig.assessmentKey}_practitioner_analysis_risk_of_reoffending_${linkedtoReoffending}_details`
            ]?.value
          : undefined

      const strengthsOrProtectiveFactorsDetails =
        linkedtoStrengthsOrProtectiveFactors !== 'null'
          ? assessment.sanAssessmentData[
              `${areaConfig.assessmentKey}_practitioner_analysis_strengths_or_protective_factors_${linkedtoStrengthsOrProtectiveFactors}_details`
            ]?.value
          : undefined

      score = crimNeeds[areaConfig.crimNeedsKey][`${areaConfig.crimNeedsSubKey}OtherWeightedScore`]

      const isMissingInformation =
        linkedToHarm === 'null' ||
        linkedtoReoffending === 'null' ||
        linkedtoStrengthsOrProtectiveFactors === 'null' ||
        score === undefined ||
        motivationToMakeChanges === undefined

      // todo: remove logger after testing complete.
      logger.info(
        `isMissingInformation ${isMissingInformation}, linkedToHarm ${linkedToHarm}, linkedtoReoffending ${linkedtoReoffending}, linkedtoStrengthsOrProtectiveFactors ${linkedtoStrengthsOrProtectiveFactors}, score ${score}, motivationToMakeChanges ${motivationToMakeChanges}`,
      )

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
        isMissingInformation,
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

  const lowScoring = filterAndSortAreas(all, (score, threshold) => score <= threshold)
  const highScoring = filterAndSortAreas(all, (score, threshold) => score > threshold)
  const otherUnsorted = all.filter(area => area.criminogenicNeedsScore === undefined)

  // emptyAreas are areas that are missing from the criminogenic needs data
  const emptyAreas = groupAndSortMissingAreas(areaConfigs, crimNeeds)

  const other = groupAndSortOtherAreas(otherUnsorted).concat(emptyAreas)
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
    const riskCount = (area.linkedToHarm === 'yes' ? 2 : 0) + (area.linkedtoReoffending === 'yes' ? 1 : 0)
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

export const dateWithYear = (datetimeString: string): string | null => {
  if (!datetimeString || isBlank(datetimeString)) return undefined
  return DateTime.fromISO(datetimeString).toFormat('d MMMM yyyy')
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
