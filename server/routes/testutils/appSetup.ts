import express, { Express } from 'express'
import cookieSession from 'cookie-session'
import { v4 as uuidv4 } from 'uuid'

import routes from '../index'
import nunjucksSetup from '../../middleware/nunjucks/nunjucksSetup'
import { requestServices, Services } from '../../services'
import type { ApplicationInfo } from '../../applicationInfo'
import setupRequestServices from '../../middleware/setupRequestServices'
import setupNotFoundRoute from '../not-found/routes'
import setupErrorRoute from '../error/routes'

jest.mock('../../services/auditService')

const testAppInfo: ApplicationInfo = {
  applicationName: 'test',
  buildNumber: '1',
  gitRef: 'long ref',
  gitShortHash: 'short ref',
  branchName: 'main',
  productId: '123',
}

export const user = {
  name: 'FIRST LAST',
  userId: 'id',
  token: 'token',
  username: 'user1',
  displayName: 'First Last',
  active: true,
  activeCaseLoadId: 'MDI',
  authSource: 'NOMIS',
}

export const flashProvider = jest.fn()

function appSetup(services: Services, production: boolean, userSupplier: () => Express.User): Express {
  const app = express()

  app.set('view engine', 'njk')

  nunjucksSetup(app, testAppInfo)
  app.use(cookieSession({ keys: [''] }))
  app.use((req, res, next) => {
    req.user = userSupplier()
    req.flash = flashProvider
    res.locals = {
      user: { ...req.user },
    }
    next()
  })
  app.use((req, res, next) => {
    req.id = uuidv4()
    next()
  })
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(setupRequestServices(requestServices(services)))
  app.use(routes(services))
  app.use(setupNotFoundRoute())
  app.use(setupErrorRoute(production))

  return app
}

export function appWithAllRoutes({
  production = false,
  services = {},
  userSupplier = () => user,
}: {
  production?: boolean
  services?: Partial<Services>
  userSupplier?: () => Express.User
}): Express {
  return appSetup(services as Services, production, userSupplier)
}
