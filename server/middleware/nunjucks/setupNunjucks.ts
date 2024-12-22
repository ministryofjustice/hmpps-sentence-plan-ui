/* eslint-disable no-param-reassign */
import path from 'path'
import nunjucks from 'nunjucks'
import express from 'express'
import { ApplicationInfo } from '../applicationInfo'
import config from '../config'
import { initialiseName, mergeDeep, convertToTitleCase } from './utils'
import commonLocale from './commonLocale.json'
import { dateWithYear, sentenceLength } from './assessmentUtils'

const production = process.env.NODE_ENV === 'production'

export default function nunjucksSetup(app: express.Express, applicationInfo: ApplicationInfo): void {
  app.set('view engine', 'njk')

  app.locals.asset_path = '/assets/'
  app.locals.applicationName = 'Sentence plan'
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

  njkEnv.addGlobal('merge', (...args: object[]): object => {
    if (args.length === 0) {
      throw new Error('At least one argument must be provided')
    }

    args.forEach((arg, index) => {
      if (typeof arg !== 'object' || arg === null || Array.isArray(arg)) {
        throw new Error(`Argument ${index + 1} must be a non-null object`)
      }
    })

    return mergeDeep(...args)
  })

  njkEnv.addFilter('possessive', (value: string) => {
    if (!value) return value
    return new nunjucks.runtime.SafeString(value.endsWith('s') ? `${value}'` : `${value}'s`)
  })

  njkEnv.addFilter('initialiseName', initialiseName)
  njkEnv.addFilter('convertToTitleCase', convertToTitleCase)

  njkEnv.addGlobal('sentenceLength', sentenceLength)


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

  app.use((req, res, next) => {
    res.render = new Proxy(res.render, {
      apply(target, thisArg, [view, options, callback]) {
        const popData = req.services.sessionService.getSubjectDetails()

        return target.apply(thisArg, [
          view,
          mergeDeep(options, {
            locale: {
              common: commonLocale.en,
            },
            data: {
              popData: {
                ...popData,
                possessiveName: popData.givenName.endsWith('s') ? `${popData.givenName}'` : `${popData.givenName}'s`,
              },
            },
          }),
          callback,
        ])
      },
    })

    next()
  })
}
