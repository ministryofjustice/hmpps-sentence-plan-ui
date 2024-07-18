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
  app.locals.applicationName = 'Hmpps Sentence Plan Ui'
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
    if (errors?.body?.[fieldName]) {
      const entry = Object.entries(errors.body[fieldName]).find(([errorType, hasError]) => hasError)
      if (entry) {
        const [errorType] = entry
        return { text: locale.errors[fieldName][errorType] }
      }
    }
    return false
  })
}
