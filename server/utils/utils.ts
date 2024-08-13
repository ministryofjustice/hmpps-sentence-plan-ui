import { Person } from '../@types/Person'
import { RoshData } from '../@types/Rosh'

const properCase = (word: string): string =>
  word.length >= 1 ? word[0].toUpperCase() + word.toLowerCase().slice(1) : word

const isBlank = (str: string): boolean => !str || /^\s*$/.test(str)

/**
 * Converts a name (first name, last name, middle name, etc.) to proper case equivalent, handling double-barreled names
 * correctly (i.e. each part in a double-barreled is converted to proper case).
 * @param name name to be converted.
 * @returns name converted to proper case.
 */
const properCaseName = (name: string): string => (isBlank(name) ? '' : name.split('-').map(properCase).join('-'))

export const convertToTitleCase = (sentence: string): string =>
  isBlank(sentence) ? '' : sentence.split(' ').map(properCaseName).join(' ')

export const initialiseName = (fullName?: string): string | null => {
  // this check is for the authError page
  if (!fullName) return null

  const array = fullName.split(' ')
  return `${array[0][0]}. ${array.reverse()[0]}`
}

export const toKebabCase = (string: string) =>
  isBlank(string) ? '' : string.trim().replace(/ /g, '-').toLowerCase().replace(',', '')

export function formatRoSHData(data: RoshData) {
  const { overallRisk, assessedOn, riskInCommunity } = data
  if ([overallRisk, assessedOn, riskInCommunity].includes(undefined)) {
    return { hasBeenCompleted: false }
  }
  return {
    hasBeenCompleted: true,
    riskInCommunity,
    lastUpdated: formatDate(assessedOn),
  }
}

export function formatPOPData(data: Person): Person {
  return { ...data, doB: formatDate(data.doB) }
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatDateWithStyle(isoDate: string, style: 'short' | 'full' | 'long' | 'medium' = 'long'): string {
  return new Date(isoDate).toLocaleDateString('en-gb', { dateStyle: style })
}

export function dateToISOFormat(date: string): string {
  const [day, month, year] = date.split('/')
  return [year, month, day].join('-')
}

export function moveGoal(goals: Array<any>, gUuid: string, operation: string) {
  const orderedGoals = [...goals]
  const index = orderedGoals.findIndex(goal => goal.uuid === gUuid)

  if (index === -1 || (operation !== 'up' && operation !== 'down')) {
    return orderedGoals
  }
  const valueSetter = {
    up: (i: number) => i - 1,
    down: (i: number) => i + 1,
  }
  const targetIndex = valueSetter[operation](index)

  if (targetIndex < 0 || targetIndex >= orderedGoals.length) {
    return orderedGoals
  }

  ;[orderedGoals[index], orderedGoals[targetIndex]] = [orderedGoals[targetIndex], orderedGoals[index]]
  orderedGoals[index].goalOrder = index
  orderedGoals[targetIndex].goalOrder = targetIndex
  return orderedGoals.map(({ uuid: goalUuid, goalOrder }) => ({ goalUuid, goalOrder }))
}

export function getAchieveDateOptions(date: Date, dateOptionsInMonths = [3, 6, 12, 24]) {
  return dateOptionsInMonths.map(option => {
    const achieveDate = new Date(date)
    achieveDate.setMonth(date.getMonth() + option)
    return achieveDate
  })
}
