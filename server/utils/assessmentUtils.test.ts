import {
  assessmentUndefined,
  completeAssessmentData,
  crimNeedsOrdered,
  fullCrimNeeds,
  incompleteAssessmentData,
} from '../testutils/data/testAssessmentData'
import commonLocale from './commonLocale.json'
import { areaConfigs } from './assessmentAreaConfig.json'
import { AssessmentArea } from '../@types/Assessment'
import {
  formatAssessmentData,
  groupAndSortOtherAreas,
  motivationText,
  sentenceLength,
  yearsAndDaysElapsed,
} from './assessmentUtils'

describe('format assessment data', () => {
  it('returns empty arrays when assessment is null', () => {
    const result = formatAssessmentData(fullCrimNeeds, null, areaConfigs)
    expect(result).toEqual({
      isAssessmentComplete: false,
      areas: { incompleteAreas: [], lowScoring: [], highScoring: [], other: [] },
    })
  })

  it('returns empty arrays when assessment has no SAN data', () => {
    const result = formatAssessmentData(fullCrimNeeds, assessmentUndefined, areaConfigs)
    expect(result).toEqual({
      isAssessmentComplete: false,
      areas: { incompleteAreas: [], lowScoring: [], highScoring: [], other: [] },
    })
  })

  it('returns correctly grouped assessment areas and incomplete assessment', () => {
    const result = formatAssessmentData(fullCrimNeeds, incompleteAssessmentData, areaConfigs)
    expect(result.isAssessmentComplete).toEqual(false)

    expect(result.areas.incompleteAreas.length).toEqual(5)
    expect(result.areas.incompleteAreas[0].title).toEqual('Alcohol use')
    expect(result.areas.incompleteAreas[0].isAssessmentSectionNotStarted).toEqual(true)
    expect(result.areas.incompleteAreas[1].title).toEqual('Drug use')
    expect(result.areas.incompleteAreas[2].title).toEqual('Finances')

    expect(result.areas.incompleteAreas[3].title).toEqual('Personal relationships and community')
    expect(result.areas.incompleteAreas[3].overallScore).toEqual('6')
    expect(result.areas.incompleteAreas[3].isAssessmentSectionNotStarted).toEqual(false)
    expect(result.areas.incompleteAreas[3].isAssessmentSectionComplete).toEqual(false)
    expect(result.areas.incompleteAreas[4].title).toEqual('Thinking, behaviours and attitudes')
    expect(result.areas.incompleteAreas[4].overallScore).toEqual('1')
    expect(result.areas.incompleteAreas[4].isAssessmentSectionNotStarted).toEqual(false)
    expect(result.areas.incompleteAreas[4].isAssessmentSectionComplete).toEqual(false)

    expect(result.areas.highScoring.length).toEqual(1)
    expect(result.areas.highScoring[0].title).toEqual('Accommodation')
    expect(result.areas.highScoring[0].overallScore).toEqual('6')
    expect(result.areas.highScoring[0].isAssessmentSectionNotStarted).toEqual(false)
    expect(result.areas.highScoring[0].isAssessmentSectionComplete).toEqual(true)

    expect(result.areas.lowScoring.length).toEqual(1)
    expect(result.areas.lowScoring[0].title).toEqual('Employment and education')
    expect(result.areas.lowScoring[0].overallScore).toEqual('1')
    expect(result.areas.incompleteAreas[3].isAssessmentSectionNotStarted).toEqual(false)
    expect(result.areas.lowScoring[0].isAssessmentSectionComplete).toEqual(true)

    expect(result.areas.other.length).toEqual(1)
    expect(result.areas.other[0].title).toEqual('Health and wellbeing')

    // Health and Wellbeing never has a score but should be marked as complete.
    // Only this Finance behave like this. Others need the score _and_ the `section_complete` flag.
    expect(result.areas.other[0].isAssessmentSectionComplete).toEqual(true)
    expect(result.areas.other[0].isAssessmentSectionNotStarted).toEqual(false)

    result.areas.other.forEach(otherArea => {
      expect(otherArea.overallScore).toBeUndefined()
    })
  })

  it('returns education section not marked as complete when it does not have a score', () => {
    fullCrimNeeds.educationTrainingEmployability.eteOtherWeightedScore = undefined
    const result = formatAssessmentData(fullCrimNeeds, incompleteAssessmentData, areaConfigs)

    expect(result.isAssessmentComplete).toEqual(false)
    expect(result.areas.incompleteAreas[2].title).toEqual('Employment and education')
    expect(result.areas.incompleteAreas[2].isAssessmentSectionComplete).toEqual(false)
    expect(result.areas.incompleteAreas[2].isAssessmentSectionNotStarted).toEqual(false)
  })

  it('returns correctly ordered assessments by score compared to threshold in high scoring section', () => {
    const result = formatAssessmentData(crimNeedsOrdered, completeAssessmentData, areaConfigs)
    expect(result.isAssessmentComplete).toEqual(true)

    expect(result.areas.highScoring.length).toEqual(3)
    expect(result.areas.highScoring[0].title).toEqual('Drug use')
    expect(result.areas.highScoring[0].overallScore).toEqual('4')
    expect(result.areas.highScoring[1].title).toEqual('Thinking, behaviours and attitudes')
    expect(result.areas.highScoring[1].overallScore).toEqual('5')
    expect(result.areas.highScoring[2].title).toEqual('Accommodation')
    expect(result.areas.highScoring[2].overallScore).toEqual('3')
  })
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
    ['2024-11-06', undefined, undefined],
    [undefined, '2027-11-06', undefined],
    [undefined, undefined, undefined],
  ])('%s to %s should be %s', (from: string, to: string, expected: any) => {
    expect(sentenceLength(from, to, commonLocale.en.sentence)).toEqual(expected)
  })
})

describe('groupAndSortOtherAreas', () => {
  it('groups and sorts areas by risk count', () => {
    const areas: AssessmentArea[] = [
      { title: 'Area D', linkedToHarm: 'NO', linkedtoReoffending: 'NO' } as AssessmentArea,
      { title: 'Area A', linkedToHarm: 'YES', linkedtoReoffending: 'YES' } as AssessmentArea,
      { title: 'Area B', linkedToHarm: 'YES', linkedtoReoffending: 'NO' } as AssessmentArea,
      { title: 'Area C', linkedToHarm: 'NO', linkedtoReoffending: 'YES' } as AssessmentArea,
    ]

    const result = groupAndSortOtherAreas(areas)

    expect(result).toEqual([
      { title: 'Area A', linkedToHarm: 'YES', linkedtoReoffending: 'YES' },
      { title: 'Area B', linkedToHarm: 'YES', linkedtoReoffending: 'NO' },
      { title: 'Area C', linkedToHarm: 'NO', linkedtoReoffending: 'YES' },
      { title: 'Area D', linkedToHarm: 'NO', linkedtoReoffending: 'NO' },
    ])
  })

  it('handles empty array', () => {
    const areas: AssessmentArea[] = []

    const result = groupAndSortOtherAreas(areas)

    expect(result).toEqual([])
  })

  it('sorts areas alphabetically within the same risk count', () => {
    const areas: AssessmentArea[] = [
      { title: 'Area B', linkedToHarm: 'YES', linkedtoReoffending: 'NO' } as AssessmentArea,
      { title: 'Area A', linkedToHarm: 'YES', linkedtoReoffending: 'NO' } as AssessmentArea,
    ]

    const result = groupAndSortOtherAreas(areas)

    expect(result).toEqual([
      { title: 'Area A', linkedToHarm: 'YES', linkedtoReoffending: 'NO' },
      { title: 'Area B', linkedToHarm: 'YES', linkedtoReoffending: 'NO' },
    ])
  })

  it('handles areas with undefined risk values', () => {
    const areas: AssessmentArea[] = [
      { title: 'Area A', linkedToHarm: undefined, linkedtoReoffending: undefined } as AssessmentArea,
      { title: 'Area B', linkedToHarm: 'YES', linkedtoReoffending: undefined } as AssessmentArea,
    ]

    const result = groupAndSortOtherAreas(areas)

    expect(result).toEqual([
      { title: 'Area B', linkedToHarm: 'YES', linkedtoReoffending: undefined },
      { title: 'Area A', linkedToHarm: undefined, linkedtoReoffending: undefined },
    ])
  })
})
