import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import setupCreateGoalRoutes from './createGoal/routes'
import setupRemoveGoalRoutes from './removeGoal/routes'
import setupConfirmGoalRoutes from './confirmGoal/routes'
import setupAboutPopRoutes from './aboutPop/routes'
import { Page } from '../services/auditService'
import setupStepRoutes from './steps/routes'
import setupReferenceDataRoutes from './ReferenceData/routes'
import setupPlanSummaryRoutes from './plan-summary/routes'
// eslint-disable-next-line @typescript-eslint/no-unused-vars

export default function routes(services: Services): Router {
  const router = Router()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/', async (req, res, next) => {
    await services.auditService.logPageView(Page.EXAMPLE_PAGE, {
      who: res.locals.user?.username,
      correlationId: req.id,
    })
    res.render('pages/index')
  })

  setupAboutPopRoutes(router, services)
  setupCreateGoalRoutes(router, services)
  setupRemoveGoalRoutes(router, services)
  setupConfirmGoalRoutes(router, services)
  setupStepRoutes(router, services)
  setupReferenceDataRoutes(router, services)
  setupPlanSummaryRoutes(router, services)
  return router
}
