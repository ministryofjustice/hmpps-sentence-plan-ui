import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import setupCreateGoalRoutes from './createGoal/routes'
import setupRemoveGoalRoutes from './removeGoal/routes'
import setupEditGoalRoutes from './editGoal/routes'
import setupAboutPopRoutes from './aboutPop/routes'
import { Page } from '../services/auditService'
import setupReferenceDataRoutes from './ReferenceData/routes'
import setupPlanOverviewRoutes from './planOverview/routes'
import setupAgreePlanRoutes from './agree-plan/routes'
import URLs from './URLs'
import setupAddStepsRoutes from './add-steps/routes'
import setupAchieveGoalRoutes from './achieveGoal/routes'
import setupViewAchievedGoalRoutes from './viewAchievedGoal/routes'
import setupUpdateGoalRoutes from './update-goal/routes'

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

  setupAboutPopRoutes(router, services)
  setupCreateGoalRoutes(router, services)
  setupRemoveGoalRoutes(router)
  setupEditGoalRoutes(router, services)
  setupViewAchievedGoalRoutes(router)
  setupAchieveGoalRoutes(router)
  setupAddStepsRoutes(router)
  setupUpdateGoalRoutes(router, services)
  setupReferenceDataRoutes(router, services)
  setupPlanOverviewRoutes(router)
  setupAgreePlanRoutes(router)
  return router
}
