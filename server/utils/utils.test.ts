import { RoshData } from '../@types/Rosh'
import { parsedRoshData, roSHData, unComplitedRoSH } from '../testutils/data/roshData'

import {
  convertToTitleCase,
  dateToISOFormat,
  dateWithYear,
  formatAssessmentData,
  formatDate,
  formatRoSHData,
  goalStatusToTabName,
  initialiseName,
  motivationText,
  moveGoal,
  sortSteps,
  toKebabCase,
  yearsAndDaysElapsed,
} from './utils'
import { NewStep, StepStatus } from '../@types/StepType'
import { GoalStatus } from '../@types/GoalType'
import { AssessmentAreaConfig, AssessmentAreas, AssessmentResponse, CriminogenicNeedsData } from '../@types/Assessment'
import { assessmentData, assessmentDataNoAssessments, crimNeeds } from '../testutils/data/assessmentData'
import locale from '../routes/aboutPop/locale.json'

describe('convert to title case', () => {
  it.each([
    [null, null, ''],
    ['empty string', '', ''],
    ['Lower case', 'robert', 'Robert'],
    ['Upper case', 'ROBERT', 'Robert'],
    ['Mixed case', 'RoBErT', 'Robert'],
    ['Multiple words', 'RobeRT SMiTH', 'Robert Smith'],
    ['Leading spaces', '  RobeRT', '  Robert'],
    ['Trailing spaces', 'RobeRT  ', 'Robert  '],
    ['Hyphenated', 'Robert-John SmiTH-jONes-WILSON', 'Robert-John Smith-Jones-Wilson'],
  ])('%s convertToTitleCase(%s, %s)', (_: string, a: string, expected: string) => {
    expect(convertToTitleCase(a)).toEqual(expected)
  })
})

describe('initialise name', () => {
  it.each([
    [null, null, null],
    ['Empty string', '', null],
    ['One word', 'robert', 'r. robert'],
    ['Two words', 'Robert James', 'R. James'],
    ['Three words', 'Robert James Smith', 'R. Smith'],
    ['Double barrelled', 'Robert-John Smith-Jones-Wilson', 'R. Smith-Jones-Wilson'],
  ])('%s initialiseName(%s, %s)', (_: string, a: string, expected: string) => {
    expect(initialiseName(a)).toEqual(expected)
  })
})

describe('toKebabCase', () => {
  it.each([
    [null, null, ''],
    ['empty string', '', ''],
    ['Lower case', 'robert', 'robert'],
    ['Upper case', 'ROBERT', 'robert'],
    ['Mixed case', 'RoBErT', 'robert'],
    ['Multiple words', 'RobeRT SMiTH', 'robert-smith'],
    ['Leading spaces', '  RobeRT', 'robert'],
    ['Trailing spaces', 'RobeRT  ', 'robert'],
    ['Hyphenated', 'Robert-John SmiTH-jONes-WILSON', 'robert-john-smith-jones-wilson'],
  ])('%s initialiseName(%s, %s)', (_: string, a: string, expected: string) => {
    expect(toKebabCase(a)).toEqual(expected)
  })
})

describe('to return formated RoSH data', () => {
  expect(formatRoSHData(roSHData)).toEqual(parsedRoshData)
})
describe('to return uncompleted ', () => {
  expect(formatRoSHData({} as RoshData)).toEqual(unComplitedRoSH)
})
describe('to return formated date ', () => {
  expect(formatDate('2000-05-09')).toEqual('9 May 2000')
})

describe('to reorder goals correctly', () => {
  let firstGoal: any
  let secondGoal: any
  let thirdGoal: any

  beforeEach(() => {
    firstGoal = {
      uuid: '1111',
      goalOrder: 1,
    }

    secondGoal = {
      uuid: '2222',
      goalOrder: 2,
    }

    thirdGoal = {
      uuid: '3333',
      goalOrder: 3,
    }
  })

  test('should move a goal down', () => {
    const reorderedGoals = moveGoal([firstGoal, secondGoal, thirdGoal], '2222', 'down')

    expect(reorderedGoals).toEqual([
      { goalUuid: '1111', goalOrder: 1 },
      { goalUuid: '2222', goalOrder: 3 },
      { goalUuid: '3333', goalOrder: 2 },
    ])
  })

  test('should move a goal up', () => {
    const reorderedGoals = moveGoal([firstGoal, secondGoal, thirdGoal], '3333', 'up')

    expect(reorderedGoals).toEqual([
      { goalUuid: '1111', goalOrder: 1 },
      { goalUuid: '2222', goalOrder: 3 },
      { goalUuid: '3333', goalOrder: 2 },
    ])
  })

  test('should not move the first goal up', () => {
    const reorderedGoals = moveGoal([firstGoal, secondGoal, thirdGoal], '1111', 'up')

    expect(reorderedGoals).toEqual([
      { goalUuid: '1111', goalOrder: 1 },
      { goalUuid: '2222', goalOrder: 2 },
      { goalUuid: '3333', goalOrder: 3 },
    ])
  })
})

describe('sorting steps', () => {
  it('should reorder the steps based on status and updated', () => {
    const step1 = {
      description: 'Accommodation Step 1',
      actor: 'Citlalli',
      status: StepStatus.IN_PROGRESS,
      updated: 1,
    }

    const step2 = {
      description: 'Accommodation Step 2',
      actor: 'Citlalli',
      status: StepStatus.NOT_STARTED,
      updated: 0,
    }

    const step3 = {
      description: 'Accommodation Step 3',
      actor: 'Citlalli',
      status: StepStatus.IN_PROGRESS,
      updated: 1,
    }

    const step4 = {
      description: 'Accommodation Step 4',
      actor: 'Citlalli',
      status: StepStatus.COMPLETED,
      updated: 0,
    }

    const step5 = {
      description: 'Accommodation Step 5',
      actor: 'Citlalli',
      status: StepStatus.CANNOT_BE_DONE_YET,
      updated: 0,
    }

    const step6 = {
      description: 'Accommodation Step 6',
      actor: 'Citlalli',
      status: StepStatus.NO_LONGER_NEEDED,
      updated: 0,
    }

    const steps: NewStep[] = [step1, step2, step3, step4, step5, step6]

    sortSteps(steps)

    expect(steps).toEqual([step2, step1, step3, step5, step6, step4])
  })
})

describe('status to tab mapping', () => {
  it.each([
    [GoalStatus.ACTIVE, 'current'],
    [GoalStatus.FUTURE, 'future'],
    [GoalStatus.REMOVED, 'removed'],
    [GoalStatus.ACHIEVED, 'achieved'],
  ])('%s maps to %s', (actual: GoalStatus, expected: string) => {
    expect(goalStatusToTabName(actual)).toEqual(expected)
  })
})

describe('format dates correctly', () => {
  it('should format date correctly', () => {
    expect(dateToISOFormat('31/3/2023')).toEqual('2023-03-31')
    expect(dateToISOFormat('1/3/2023')).toEqual('2023-03-01')
  })
})

describe('format assessment data', () => {
  it.each([
    [
      crimNeeds,
      null,
      locale.en.areas,
      'John',
      {
        highScoring: [],
        lowScoring: [],
        versionUpdatedAt: undefined,
      },
    ],
    [
      crimNeeds,
      assessmentDataNoAssessments,
      locale.en.areas,
      'John',
      {
        highScoring: [
          {
            criminogenicNeedsScore: '6',
            linkedtoReoffending: true,
            linkedtoRoSH: false,
            motivationToMakeChanges: undefined,
            riskOfReoffending: undefined,
            riskOfSeriousHarm: undefined,
            strengthsOrProtectiveFactors: undefined,
            title: 'Accommodation',
            goalRoute: 'accommodation',
          },
        ],
        lowScoring: [
          {
            criminogenicNeedsScore: '2',
            linkedtoReoffending: true,
            linkedtoRoSH: false,
            motivationToMakeChanges: undefined,
            riskOfReoffending: undefined,
            riskOfSeriousHarm: undefined,
            strengthsOrProtectiveFactors: undefined,
            title: 'Education and employment',
            goalRoute: 'employment-and-education',
          },
        ],
        versionUpdatedAt: '2024-10-04T15:22:31.453096',
      },
    ],
    [
      crimNeeds,
      assessmentData,
      locale.en.areas,
      'John',
      {
        highScoring: [
          {
            criminogenicNeedsScore: '6',
            linkedtoReoffending: true,
            linkedtoRoSH: false,
            motivationToMakeChanges: 'John is thinking about making changes.',
            riskOfReoffending: undefined,
            riskOfSeriousHarm: undefined,
            strengthsOrProtectiveFactors: undefined,
            goalRoute: 'accommodation',
            title: 'Accommodation',
          },
        ],
        lowScoring: [
          {
            criminogenicNeedsScore: '2',
            linkedtoReoffending: true,
            linkedtoRoSH: false,
            motivationToMakeChanges: 'John wants to make changes but needs help.',
            riskOfReoffending: undefined,
            riskOfSeriousHarm: undefined,
            strengthsOrProtectiveFactors: undefined,
            title: 'Education and employment',
            goalRoute: 'employment-and-education',
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
      forename: string,
      expected: AssessmentAreas,
    ) => {
      expect(formatAssessmentData(criminogenicNeedsData, assessment, areas, forename)).toEqual(expected)
    },
  )
})

describe('replace motivation text', () => {
  it.each([
    ['MADE_CHANGES', 'John', 'John has already made positive changes and wants to maintain them.'],
    ['MAKING_CHANGES', 'John', 'John is actively making changes.'],
    ['WANT_TO_MAKE_CHANGES', 'John', 'John wants to make changes and knows how to.'],
    ['NEEDS_HELP_TO_MAKE_CHANGES', 'John', 'John wants to make changes but needs help.'],
    ['THINKING_ABOUT_MAKING_CHANGES', 'John', 'John is thinking about making changes.'],
    ['DOES_NOT_WANT_TO_MAKE_CHANGES', 'John', 'John does not want to make changes.'],
    ['DOES_NOT_WANT_TO_ANSWER', 'John', 'John does not want to answer.'],
    ['NOT_PRESENT', 'John', 'John was not present to answer this question.'],
    ['NOT_APPLICABLE', 'John', 'This question was not applicable.'],
    [undefined, 'John', undefined],
  ])('%s %s maps to %s', (optionResult: string, name: string, expected: string) => {
    expect(motivationText(optionResult, name)).toEqual(expected)
  })
})

describe('format date with year', () => {
  it.each([
    ['2024-11-04T10:17:00.217158', '4 November 2024'],
    [undefined, undefined],
  ])('%s maps to %s', (date: string, expected: string) => {
    expect(dateWithYear(date)).toEqual(expected)
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
