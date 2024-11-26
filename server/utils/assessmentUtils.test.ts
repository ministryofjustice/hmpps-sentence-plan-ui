import {
  assessmentData,
  assessmentDataNoAssessments,
  assessmentUndefined,
  crimNeeds,
} from '../testutils/data/assessmentData'
import locale from '../routes/aboutPop/locale.json'
import { AssessmentAreaConfig, AssessmentAreas, AssessmentResponse, CriminogenicNeedsData } from '../@types/Assessment'
import { formatAssessmentData, motivationText, yearsAndDaysElapsed } from './assessmentUtils'

describe('format assessment data', () => {
  it.each([
    [
      crimNeeds,
      assessmentUndefined,
      locale.en.areas,
      {
        highScoring: [],
        lowScoring: [],
        other: [],
        versionUpdatedAt: undefined,
      },
    ],
    [
      crimNeeds,
      null,
      locale.en.areas,
      {
        highScoring: [],
        lowScoring: [],
        other: [],
        versionUpdatedAt: undefined,
      },
    ],
    [
      crimNeeds,
      assessmentDataNoAssessments,
      locale.en.areas,
      {
        highScoring: [
          {
            criminogenicNeedsScore: '6',
            linkedtoReoffending: true,
            linkedtoRoSH: false,
            overallScore: '6',
            riskOfReoffending: undefined,
            thresholdValue: 1,
            title: 'Accommodation',
            goalRoute: 'accommodation',
            upperBound: 6,
          },
        ],
        lowScoring: [
          {
            criminogenicNeedsScore: '1',
            linkedtoReoffending: true,
            linkedtoRoSH: false,
            overallScore: '1',
            riskOfReoffending: undefined,
            thresholdValue: 1,
            title: 'Employment and education',
            goalRoute: 'employment-and-education',
            upperBound: 4,
          },
        ],
        other: [
          {
            goalRoute: 'alcohol-use',
            linkedtoReoffending: undefined,
            linkedtoRoSH: undefined,
            riskOfReoffending: undefined,
            thresholdValue: 1,
            title: 'Alcohol use',
            upperBound: 4,
          },
          {
            goalRoute: 'drug-use',
            linkedtoReoffending: undefined,
            linkedtoRoSH: undefined,
            riskOfReoffending: undefined,
            thresholdValue: 0,
            title: 'Drug use',
            upperBound: 8,
          },
          {
            goalRoute: 'finances',
            linkedtoReoffending: undefined,
            linkedtoRoSH: undefined,
            riskOfReoffending: undefined,
            title: 'Finances',
            upperBound: null,
          },
          {
            goalRoute: 'health-and-wellbeing',
            linkedtoReoffending: false,
            linkedtoRoSH: false,
            riskOfReoffending: undefined,
            title: 'Health and wellbeing',
            upperBound: null,
          },
          {
            goalRoute: 'personal-relationships-and-community',
            linkedtoReoffending: undefined,
            linkedtoRoSH: undefined,
            riskOfReoffending: undefined,
            thresholdValue: 1,
            title: 'Personal relationships and community',
            upperBound: 6,
          },
          {
            goalRoute: 'thinking-behaviours-and-attitudes',
            linkedtoReoffending: undefined,
            linkedtoRoSH: undefined,
            riskOfReoffending: undefined,
            thresholdValue: 2,
            title: 'Thinking, behaviours and attitudes',
            upperBound: 10,
          },
        ],
        versionUpdatedAt: '2024-10-04T15:22:31.453096',
      },
    ],
    [
      crimNeeds,
      assessmentData,
      locale.en.areas,
      {
        highScoring: [
          {
            criminogenicNeedsScore: '6',
            linkedtoReoffending: true,
            linkedtoRoSH: false,
            motivationToMakeChanges: 'thinkingAboutMakingChanges',
            overallScore: '6',
            riskOfReoffending: undefined,
            goalRoute: 'accommodation',
            thresholdValue: 1,
            title: 'Accommodation',
            upperBound: 6,
          },
        ],
        lowScoring: [
          {
            criminogenicNeedsScore: '1',
            linkedtoReoffending: true,
            linkedtoRoSH: false,
            motivationToMakeChanges: 'needsHelpToMakeChanges',
            overallScore: '1',
            riskOfReoffending: undefined,
            thresholdValue: 1,
            title: 'Employment and education',
            goalRoute: 'employment-and-education',
            upperBound: 4,
          },
        ],
        other: [
          {
            goalRoute: 'alcohol-use',
            linkedtoReoffending: undefined,
            linkedtoRoSH: undefined,
            riskOfReoffending: undefined,
            thresholdValue: 1,
            title: 'Alcohol use',
            upperBound: 4,
          },
          {
            goalRoute: 'drug-use',
            linkedtoReoffending: undefined,
            linkedtoRoSH: undefined,
            riskOfReoffending: undefined,
            thresholdValue: 0,
            title: 'Drug use',
            upperBound: 8,
          },
          {
            goalRoute: 'finances',
            linkedtoReoffending: undefined,
            linkedtoRoSH: undefined,
            riskOfReoffending: undefined,
            title: 'Finances',
            upperBound: null,
          },
          {
            goalRoute: 'health-and-wellbeing',
            linkedtoReoffending: false,
            linkedtoRoSH: false,
            riskOfReoffending: undefined,
            title: 'Health and wellbeing',
            upperBound: null,
          },
          {
            goalRoute: 'personal-relationships-and-community',
            linkedtoReoffending: undefined,
            linkedtoRoSH: undefined,
            riskOfReoffending: undefined,
            thresholdValue: 1,
            title: 'Personal relationships and community',
            upperBound: 6,
          },
          {
            goalRoute: 'thinking-behaviours-and-attitudes',
            linkedtoReoffending: undefined,
            linkedtoRoSH: undefined,
            riskOfReoffending: undefined,
            thresholdValue: 2,
            title: 'Thinking, behaviours and attitudes',
            upperBound: 10,
          },
        ],
        versionUpdatedAt: '2024-10-04T15:22:31.453096',
      },
    ],
  ])(
    '%s formatAssessmentData(%s, %s, %s, %s',
    (
      criminogenicNeedsData: CriminogenicNeedsData,
      assessment: AssessmentResponse,
      areas: AssessmentAreaConfig[],
      expected: AssessmentAreas,
    ) => {
      expect(formatAssessmentData(criminogenicNeedsData, assessment, areas)).toEqual(expected)
    },
  )
})

describe('replace motivation text', () => {
  it.each([
    ['MADE_CHANGES', 'madeChanges'],
    ['MAKING_CHANGES', 'makingChanges'],
    ['WANT_TO_MAKE_CHANGES', 'wantToMakeChanges'],
    ['NEEDS_HELP_TO_MAKE_CHANGES', 'needsHelpToMakeChanges'],
    ['THINKING_ABOUT_MAKING_CHANGES', 'thinkingAboutMakingChanges'],
    ['DOES_NOT_WANT_TO_MAKE_CHANGES', 'doesNotWantToMakeChanges'],
    ['DOES_NOT_WANT_TO_ANSWER', 'doesNotWantToAnswer'],
    ['NOT_PRESENT', 'notPresent'],
    ['NOT_APPLICABLE', 'notApplicable'],
    [undefined, undefined],
  ])('%s %s maps to %s', (optionResult: string, expected: string) => {
    expect(motivationText(optionResult)).toEqual(expected)
  })
})

describe('years and days elapsed', () => {
  it.each([
    ['2024-11-06', '2029-01-12', '(4 years and 67 days)'],
    [undefined, undefined, undefined],
  ])('%s maps to %s', (from: string, to: string, expected: string) => {
    expect(yearsAndDaysElapsed(from, to)).toEqual(expected)
  })
})
