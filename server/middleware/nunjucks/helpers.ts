import { mergeDeep } from '../../utils/utils'

export const localeInterpolation = (locale: object, replacements: Record<string, any>) => {
  const interpolateString = (str: string): string => {
    return str.replace(/\{\{\s*([^}]+)\s*}}/g, (match: string, expression: string) => {
      return (
        expression
          .trim()
          .split(/[.[\]]+/)
          .filter(Boolean)
          .reduce(
            (acc: Record<string, any> | undefined, key: string) =>
              acc && acc[key] !== undefined ? acc[key] : undefined,
            replacements,
          ) ?? match
      )
    })
  }

  const interpolateObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return interpolateString(obj)
    }

    if (Array.isArray(obj)) {
      return obj.map(item => interpolateObject(item))
    }

    if (typeof obj === 'object' && obj !== null) {
      return Object.entries(obj).reduce((acc: Record<string, any>, [key, value]) => {
        acc[key] = interpolateObject(value)
        return acc
      }, {})
    }

    return obj
  }

  return interpolateObject(locale)
}

export const toFormattedError = (errors: any, locale: any, fieldName: string) => {
  const fieldErrors = errors?.body?.[fieldName]

  if (errors?.body?.[fieldName]) {
    const errorType = Object.keys(fieldErrors)[0]

    if (errorType) {
      return {
        text: locale.errors[fieldName][errorType],
        href: `#${fieldName}`,
      }
    }
  }
  return false
}

export const formatDate = (date: string, format: 'iso' | 'simple') => {
  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return ''
  }

  switch (format) {
    case 'iso': // 'YYYY-MM-DD' - 1990-01-01
      return parsedDate.toISOString().substring(0, 10)
    case 'simple': // 'DD MMMMM YYYY' - 01 January 1990
    default:
      return parsedDate.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
  }
}

export const merge = (...args: object[]): object => {
  if (args.length === 0) {
    throw new Error('At least one argument must be provided')
  }

  args.forEach((arg, index) => {
    if (typeof arg !== 'object' || arg === null || Array.isArray(arg)) {
      throw new Error(`Argument ${index + 1} must be a non-null object`)
    }
  })

  return mergeDeep(...args)
}

export const splitString = (input: string, delimiter: string) => {
  return input.split(delimiter)
}

export const isPastOrToday = (input: string) => {
  if (!input) return false

  const inputDate = new Date(input)
  const today = new Date()

  // Zero out time to compare just dates
  inputDate.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)

  return inputDate <= today
}
