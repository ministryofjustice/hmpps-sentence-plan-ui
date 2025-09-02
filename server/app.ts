import express from 'express'
import nunjucksSetup from './middleware/nunjucks/nunjucksSetup'
import { appInsightsMiddleware } from './utils/azureAppInsights'
import setUpCsrf from './middleware/setUpCsrf'
import setUpHealthChecks from './middleware/setUpHealthChecks'
import setUpStaticResources from './middleware/setUpStaticResources'
import setUpWebRequestParsing from './middleware/setupRequestParsing'
import setUpWebSecurity from './middleware/setUpWebSecurity'
import setUpWebSession from './middleware/setUpWebSession'
import routes from './routes'
import { requestServices, Services } from './services'
import setupRequestServices from './middleware/setupRequestServices'
import setupAuthentication from './middleware/setUpAuthentication'
import authorisationMiddleware from './middleware/authorisationMiddleware'
import setupNotFoundRoute from './routes/not-found/routes'
import setupErrorRoute from './routes/error/routes'

export default function createApp(services: Services): express.Application {
  const app = express()

  app.set('json spaces', 2)
  app.set('trust proxy', true)
  app.set('port', process.env.PORT || 3000)

  app.use(appInsightsMiddleware())
  app.use(setUpHealthChecks(services.applicationInfo))
  app.use(setUpWebSecurity())
  app.use(setUpWebSession())
  app.use(setUpWebRequestParsing())
  app.use(setUpStaticResources())
  nunjucksSetup(app, services.applicationInfo)
  app.use(setupRequestServices(requestServices(services)))
  app.use(setupAuthentication())
  app.use(authorisationMiddleware())
  app.use(setUpCsrf())

  app.use(routes(services))
  app.use(setupNotFoundRoute())
  app.use(setupErrorRoute())

  app.disable('x-powered-by')

  return app
}
