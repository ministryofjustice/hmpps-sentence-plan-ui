import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import setupCreateGoalRoutes from './createGoal/routes'
import setupRemoveGoalRoutes from './removeGoal/routes'
import setupEditGoalRoutes from './editGoal/routes'
import setupAboutPopRoutes from './aboutPop/routes'
import { Page } from '../services/auditService'
import setupReferenceDataRoutes from './ReferenceData/routes'
import setupPlanSummaryRoutes from './plan-summary/routes'
import setupAgreePlanRoutes from './agree-plan/routes'
import URLs from './URLs'
import setupAddStepsRoutes from './add-steps/routes'
import setupAchieveGoalRoutes from './achieveGoal/routes'

export default function routes(services: Services): Router {
  const router = Router()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/', async (req, res, next) => {
    await services.auditService.logPageView(Page.EXAMPLE_PAGE, {
      who: res.locals.user?.username,
      correlationId: req.id,
    })
    res.redirect(URLs.PLAN_SUMMARY)
  })

  setupAboutPopRoutes(router, services)
  setupCreateGoalRoutes(router, services)
  setupRemoveGoalRoutes(router)
  setupEditGoalRoutes(router, services)
  setupAchieveGoalRoutes(router)
  setupAddStepsRoutes(router)
  setupReferenceDataRoutes(router, services)
  setupPlanSummaryRoutes(router)
  setupAgreePlanRoutes(router)
  return router
}
