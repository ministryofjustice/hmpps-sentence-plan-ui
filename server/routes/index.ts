import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import setupCreateGoalRoutes from './create-goal/routes'
import setupRemoveGoalRoutes from './remove-goal/routes'
import setupChangeGoalRoutes from './change-goal/routes'
import setupAboutPopRoutes from './about-person/routes'
import { Page } from '../services/auditService'
import setupReferenceDataRoutes from './reference-data/routes'
import setupPlanOverviewRoutes from './plan-overview/routes'
import setupAgreePlanRoutes from './agree-plan/routes'
import URLs from './URLs'
import setupAddStepsRoutes from './add-steps/routes'
import setupAchieveGoalRoutes from './achieve-goal/routes'
import setupUpdateGoalRoutes from './update-goal/routes'
import setupViewGoalDetailsRoutes from './view-goal-details/routes'
import setupPlanHistoryRoutes from './plan-history/routes'

export default function routes(services: Services): Router {
  const router = Router()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/', async (req, res, next) => {
    await services.auditService.logPageView(Page.EXAMPLE_PAGE, {
      who: res.locals.user?.username,
      correlationId: req.id,
    })
    res.redirect(URLs.PLAN_OVERVIEW)
  })

  setupAboutPopRoutes(router)
  setupCreateGoalRoutes(router, services)
  setupRemoveGoalRoutes(router)
  setupChangeGoalRoutes(router, services)
  setupViewGoalDetailsRoutes(router)
  setupAchieveGoalRoutes(router)
  setupAddStepsRoutes(router)
  setupUpdateGoalRoutes(router, services)
  setupReferenceDataRoutes(router, services)
  setupPlanOverviewRoutes(router)
  setupAgreePlanRoutes(router)
  setupPlanHistoryRoutes(router)
  return router
}
