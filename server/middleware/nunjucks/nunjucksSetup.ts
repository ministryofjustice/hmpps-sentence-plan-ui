/* eslint-disable no-param-reassign */
import path from 'path'
import nunjucks from 'nunjucks'
import express from 'express'
import { ApplicationInfo } from '../../applicationInfo'
import config from '../../config'
import { initialiseName, mergeDeep, convertToTitleCase, nameFormatter } from '../../utils/utils'
import commonLocale from '../../utils/commonLocale.json'
import { sentenceLength } from '../../utils/assessmentUtils'
import { formatDate, localeInterpolation, merge, splitString, toFormattedError } from './helpers'

const production = process.env.NODE_ENV === 'production'

export default function nunjucksSetup(app: express.Express, applicationInfo: ApplicationInfo): void {
  app.set('view engine', 'njk')

  app.locals.asset_path = '/assets/'
  app.locals.applicationName = 'Sentence plan'
  app.locals.deploymentName = config.deploymentName
  app.locals.environmentName = config.environmentName
  app.locals.environmentNameColour = config.environmentName === 'PRE-PRODUCTION' ? 'govuk-tag--green' : ''
  app.locals.sessionExpiryTime = config.session.expiryMinutes
  app.locals.managePeopleOnProbationUrl = config.managePeopleOnProbationUrl
  app.locals.oasysUrl = config.oasysUrl

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
      path.join(__dirname, '../../../server/views'),
      path.join(__dirname, 'server/views'),
      'node_modules/govuk-frontend/dist/',
      'node_modules/@ministryofjustice/frontend/',
      'node_modules/hmrc-frontend/',
    ],
    {
      autoescape: true,
      express: app,
    },
  )

  /** FILTERS * */
  njkEnv.addFilter('initialiseName', initialiseName)
  njkEnv.addFilter('convertToTitleCase', convertToTitleCase)
  njkEnv.addFilter('formatSimpleDate', date => formatDate(date, 'simple'))
  njkEnv.addFilter('formatISODate', date => formatDate(date, 'iso'))
  njkEnv.addFilter('splitString', splitString)

  /** GLOBALS * */
  njkEnv.addGlobal('merge', merge)
  njkEnv.addGlobal('sentenceLength', sentenceLength)
  njkEnv.addGlobal('interpolate', localeInterpolation)
  njkEnv.addGlobal('getFormattedError', toFormattedError)

  app.use((req, res, next) => {
    res.render = new Proxy(res.render, {
      apply(target, thisArg, [view, options, callback]) {
        const subjectDetails = req.services.sessionService.getSubjectDetails()
        const popData = subjectDetails && {
          ...subjectDetails,
          possessiveName: nameFormatter(subjectDetails?.givenName),
        }

        return target.apply(thisArg, [
          view,
          mergeDeep(options, {
            locale: {
              common: commonLocale.en,
            },
            data: {
              popData,
            },
          }),
          callback,
        ])
      },
    })

    next()
  })
}
