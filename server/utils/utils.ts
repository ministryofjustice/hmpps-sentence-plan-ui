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

export const toKebabCase = (string: string) => (isBlank(string) ? '' : string.trim().replace(/ /g, '-').toLowerCase())

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

export function deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key] || typeof target[key] !== 'object') {
          target[key] = {};
        }
        target[key] = deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }

  return target;
}
