import { RoshData } from '../@types/Rosh'
import { parsedRoshData, roSHData, unComplitedRoSH } from '../testutils/data/roshData'
import { convertToTitleCase, formatDate, formatRoSHData, initialiseName, moveGoal, toKebabCase } from './utils'

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
