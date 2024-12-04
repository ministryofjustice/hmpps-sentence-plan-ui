import {
  assessmentData,
  assessmentDataNoAssessments,
  assessmentUndefined,
  crimNeedsSubset,
  crimNeedsOrdered,
} from '../testutils/data/assessmentData'
import commonLocale from './commonLocale.json'
import locale from '../routes/aboutPop/locale.json'
import {
  AssessmentArea,
  AssessmentAreaConfig,
  AssessmentAreas,
  AssessmentResponse,
  CriminogenicNeedsData,
} from '../@types/Assessment'
import {
  formatAssessmentData,
  groupAndSortOtherAreas,
  motivationText,
  sentenceLength,
  yearsAndDaysElapsed,
} from './assessmentUtils'

describe('format assessment data', () => {
  it.each([
    [
      crimNeedsSubset,
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
      crimNeedsSubset,
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
      crimNeedsSubset,
      assessmentDataNoAssessments,
      locale.en.areas,
      {
        highScoring: [
          {
            criminogenicNeedsScore: '6',
            linkedtoReoffending: true,
            linkedtoRoSH: false,
            overallScore: '6',
            riskOfReoffendingDetails: undefined,
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
            riskOfReoffendingDetails: undefined,
            thresholdValue: 1,
            title: 'Employment and education',
            goalRoute: 'employment-and-education',
            upperBound: 4,
          },
        ],
        other: [
          {
            goalRoute: 'health-and-wellbeing',
            title: 'Health and wellbeing',
            upperBound: null,
            linkedtoReoffending: false,
            linkedtoRoSH: false,
            riskOfReoffendingDetails: undefined,
          },
          {
            goalRoute: 'alcohol-use',
            title: 'Alcohol use',
            criminogenicNeedMissing: true,
            linkedtoReoffending: undefined,
            linkedtoRoSH: undefined,
          },
          {
            goalRoute: 'drug-use',
            title: 'Drug use',
            criminogenicNeedMissing: true,
            linkedtoReoffending: undefined,
            linkedtoRoSH: undefined,
          },
          {
            goalRoute: 'finances',
            title: 'Finances',
            criminogenicNeedMissing: true,
            linkedtoReoffending: undefined,
            linkedtoRoSH: undefined,
          },
          {
            goalRoute: 'personal-relationships-and-community',
            title: 'Personal relationships and community',
            criminogenicNeedMissing: true,
            linkedtoReoffending: undefined,
            linkedtoRoSH: undefined,
          },
          {
            goalRoute: 'thinking-behaviours-and-attitudes',
            title: 'Thinking, behaviours and attitudes',
            criminogenicNeedMissing: true,
            linkedtoReoffending: undefined,
            linkedtoRoSH: undefined,
          },
        ],
        versionUpdatedAt: '2024-10-04T15:22:31.453096',
      },
    ],
    [
      crimNeedsSubset,
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
            riskOfReoffendingDetails: undefined,
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
            riskOfReoffendingDetails: undefined,
            thresholdValue: 1,
            title: 'Employment and education',
            goalRoute: 'employment-and-education',
            upperBound: 4,
          },
        ],
        other: [
          {
            goalRoute: 'health-and-wellbeing',
            title: 'Health and wellbeing',
            upperBound: null,
            linkedtoReoffending: false,
            linkedtoRoSH: false,
            riskOfReoffendingDetails: undefined,
          },
          {
            goalRoute: 'alcohol-use',
            title: 'Alcohol use',
            criminogenicNeedMissing: true,
            linkedtoReoffending: undefined,
            linkedtoRoSH: undefined,
          },
          {
            goalRoute: 'drug-use',
            title: 'Drug use',
            criminogenicNeedMissing: true,
            linkedtoReoffending: undefined,
            linkedtoRoSH: undefined,
          },
          {
            goalRoute: 'finances',
            title: 'Finances',
            criminogenicNeedMissing: true,
            linkedtoReoffending: undefined,
            linkedtoRoSH: undefined,
          },
          {
            goalRoute: 'personal-relationships-and-community',
            title: 'Personal relationships and community',
            criminogenicNeedMissing: true,
            linkedtoReoffending: undefined,
            linkedtoRoSH: undefined,
          },
          {
            goalRoute: 'thinking-behaviours-and-attitudes',
            title: 'Thinking, behaviours and attitudes',
            criminogenicNeedMissing: true,
            linkedtoReoffending: undefined,
            linkedtoRoSH: undefined,
          },
        ],
        versionUpdatedAt: '2024-10-04T15:22:31.453096',
      },
    ],
    [
      crimNeedsOrdered,
      assessmentDataNoAssessments,
      locale.en.areas,
      {
        highScoring: [
          {
            criminogenicNeedsScore: '4',
            goalRoute: 'drug-use',
            linkedtoReoffending: false,
            linkedtoRoSH: false,
            riskOfReoffendingDetails: undefined,
            overallScore: '4',
            thresholdValue: 0,
            title: 'Drug use',
            upperBound: 8,
          },
          {
            criminogenicNeedsScore: '5',
            goalRoute: 'thinking-behaviours-and-attitudes',
            linkedtoReoffending: false,
            linkedtoRoSH: false,
            riskOfReoffendingDetails: undefined,
            overallScore: '5',
            thresholdValue: 2,
            title: 'Thinking, behaviours and attitudes',
            upperBound: 10,
          },
          {
            criminogenicNeedsScore: '3',
            goalRoute: 'accommodation',
            linkedtoReoffending: false,
            linkedtoRoSH: false,
            riskOfReoffendingDetails: undefined,
            overallScore: '3',
            thresholdValue: 1,
            title: 'Accommodation',
            upperBound: 6,
          },
        ],
        lowScoring: [],
        other: [
          {
            goalRoute: 'alcohol-use',
            title: 'Alcohol use',
            criminogenicNeedMissing: true,
            linkedtoReoffending: undefined,
            linkedtoRoSH: undefined,
          },
          {
            goalRoute: 'employment-and-education',
            title: 'Employment and education',
            criminogenicNeedMissing: true,
            linkedtoReoffending: undefined,
            linkedtoRoSH: undefined,
          },
          {
            goalRoute: 'finances',
            title: 'Finances',
            criminogenicNeedMissing: true,
            linkedtoReoffending: undefined,
            linkedtoRoSH: undefined,
          },
          {
            goalRoute: 'health-and-wellbeing',
            title: 'Health and wellbeing',
            criminogenicNeedMissing: true,
            linkedtoReoffending: undefined,
            linkedtoRoSH: undefined,
          },
          {
            goalRoute: 'personal-relationships-and-community',
            title: 'Personal relationships and community',
            criminogenicNeedMissing: true,
            linkedtoReoffending: undefined,
            linkedtoRoSH: undefined,
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

describe('years, months and days elapsed', () => {
  it.each([
    ['2024-11-06', '2029-01-12', { days: 6, months: 2, years: 4 }],
    ['2024-11-06', '2024-11-07', { days: 1, months: 0, years: 0 }],
  ])('%s maps to %s', (from: string, to: string, expected: any) => {
    expect(yearsAndDaysElapsed(from, to).values).toEqual(expected)
  })
})

describe('sentence length', () => {
  it.each([
    ['2024-11-06', '2029-01-12', '(4 years, 2 months and 6 days)'],
    ['2024-11-06', '2028-12-06', '(4 years and 1 month)'],
    ['2024-11-06', '2029-11-12', '(5 years and 6 days)'],
    ['2024-11-06', '2025-11-07', '(1 year and 1 day)'],
    ['2024-11-06', '2025-01-12', '(2 months and 6 days)'],
    ['2024-11-06', '2025-01-07', '(2 months and 1 day)'],
    ['2024-11-06', '2024-11-07', '(1 day)'],
    ['2024-11-06', '2025-01-06', '(2 months)'],
    ['2024-11-06', '2027-11-06', '(3 years)'],
  ])('%s to %s should be %s', (from: string, to: string, expected: any) => {
    expect(sentenceLength(from, to, commonLocale.en.sentence)).toEqual(expected)
  })
})

describe('groupAndSortOtherAreas', () => {
  it('groups and sorts areas by risk count', () => {
    const areas: AssessmentArea[] = [
      { title: 'Area D', linkedtoRoSH: false, linkedtoReoffending: false } as AssessmentArea,
      { title: 'Area A', linkedtoRoSH: true, linkedtoReoffending: true } as AssessmentArea,
      { title: 'Area B', linkedtoRoSH: true, linkedtoReoffending: false } as AssessmentArea,
      { title: 'Area C', linkedtoRoSH: false, linkedtoReoffending: true } as AssessmentArea,
    ]

    const result = groupAndSortOtherAreas(areas)

    expect(result).toEqual([
      { title: 'Area A', linkedtoRoSH: true, linkedtoReoffending: true },
      { title: 'Area B', linkedtoRoSH: true, linkedtoReoffending: false },
      { title: 'Area C', linkedtoRoSH: false, linkedtoReoffending: true },
      { title: 'Area D', linkedtoRoSH: false, linkedtoReoffending: false },
    ])
  })

  it('handles empty array', () => {
    const areas: AssessmentArea[] = []

    const result = groupAndSortOtherAreas(areas)

    expect(result).toEqual([])
  })

  it('sorts areas alphabetically within the same risk count', () => {
    const areas: AssessmentArea[] = [
      { title: 'Area B', linkedtoRoSH: true, linkedtoReoffending: false } as AssessmentArea,
      { title: 'Area A', linkedtoRoSH: true, linkedtoReoffending: false } as AssessmentArea,
    ]

    const result = groupAndSortOtherAreas(areas)

    expect(result).toEqual([
      { title: 'Area A', linkedtoRoSH: true, linkedtoReoffending: false },
      { title: 'Area B', linkedtoRoSH: true, linkedtoReoffending: false },
    ])
  })

  it('handles areas with undefined risk values', () => {
    const areas: AssessmentArea[] = [
      { title: 'Area A', linkedtoRoSH: undefined, linkedtoReoffending: undefined } as AssessmentArea,
      { title: 'Area B', linkedtoRoSH: true, linkedtoReoffending: undefined } as AssessmentArea,
    ]

    const result = groupAndSortOtherAreas(areas)

    expect(result).toEqual([
      { title: 'Area B', linkedtoRoSH: true, linkedtoReoffending: undefined },
      { title: 'Area A', linkedtoRoSH: undefined, linkedtoReoffending: undefined },
    ])
  })
})
