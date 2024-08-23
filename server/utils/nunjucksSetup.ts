/* eslint-disable no-param-reassign */
import path from 'path'
import nunjucks from 'nunjucks'
import express from 'express'
import { initialiseName } from './utils'
import { ApplicationInfo } from '../applicationInfo'
import config from '../config'

const production = process.env.NODE_ENV === 'production'

export default function nunjucksSetup(app: express.Express, applicationInfo: ApplicationInfo): void {
  app.set('view engine', 'njk')

  app.locals.asset_path = '/assets/'
  app.locals.applicationName = 'Sentence Plan'
  app.locals.environmentName = config.environmentName
  app.locals.environmentNameColour = config.environmentName === 'PRE-PRODUCTION' ? 'govuk-tag--green' : ''

  // Cachebusting version string
  if (production) {
    // Version only changes with new commits
    app.locals.version = applicationInfo.gitShortHash
  } else {
    // Version changes every request
    app.use((req, res, next) => {
      res.locals.version = Date.now().toString()
      return next()
    })
  }

  const njkEnv = nunjucks.configure(
    [
      path.join(__dirname, '../../server/views'),
      path.join(__dirname, 'server/views'),
      'node_modules/govuk-frontend/dist/',
      'node_modules/@ministryofjustice/frontend/',
      'node_modules/hmpps-court-cases-release-dates-design/',
      'node_modules/hmpps-court-cases-release-dates-design/hmpps/components/',
    ],
    {
      autoescape: true,
      express: app,
    },
  )

  njkEnv.addGlobal('merge', (obj1: object, obj2: object) => {
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
      throw new Error('Both arguments must be objects')
    }

    return { ...obj1, ...obj2 }
  })

  njkEnv.addFilter('possessive', (value: string) => {
    if (!value) return value
    return new nunjucks.runtime.SafeString(value.endsWith('s') ? `${value}'` : `${value}'s`)
  })

  njkEnv.addFilter('initialiseName', initialiseName)

  // Filter to format date as 'Month YYYY'
  njkEnv.addFilter('formatMonthYear', date => {
    return new Date(date).toLocaleDateString('en-GB', {
      month: 'long',
      year: 'numeric',
    })
  })

  // Filter to format date as 'DD MMMMM YYYY'
  njkEnv.addFilter('formatSimpleDate', date => {
    if (date == null) {
      return ''
    }
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  })

  // Filter to format date as 'YYYY-MM-DD'
  njkEnv.addFilter('formatISODate', date => {
    return new Date(date).toISOString().substring(0, 10)
  })

  njkEnv.addGlobal('getFormattedError', (errors: any, locale: any, fieldName: string) => {
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
  })

  // Filter to format actors
  njkEnv.addFilter('getActors', actors => {
    return actors.map((item: any) => item.actor)
  })

  // Filter to format related area of need
  njkEnv.addFilter('getRelatedAreaOfNeed', relatedAreaOfNeed => {
    return relatedAreaOfNeed.map((item: any) => item.name)
  })

  // get months difference
  njkEnv.addGlobal('getMonthsDifference', (creationDate: string, targetDate: string) => {
    const [creationYear, creationMonth] = creationDate.split('-').map(Number)
    const [targetYear, targetMonth] = targetDate.split('-').map(Number)
    return (targetYear - creationYear) * 12 + (targetMonth - creationMonth)
  })

  njkEnv.addGlobal('interpolate', (locale: object, replacements: Record<string, any>) => {
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
  })
}
