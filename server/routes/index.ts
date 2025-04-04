import { type RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import setupCreateGoalRoutes from './createGoal/routes'
import setupRemoveGoalRoutes from './removeGoal/routes'
import setupChangeGoalRoutes from './changeGoal/routes'
import setupAboutPersonRoutes from './aboutPerson/routes'
import { Page } from '../services/auditService'
import setupReferenceDataRoutes from './ReferenceData/routes'
import setupPlanOverviewRoutes from './planOverview/routes'
import setupAgreePlanRoutes from './agree-plan/routes'
import URLs from './URLs'
import setupAddStepsRoutes from './add-steps/routes'
import setupAchieveGoalRoutes from './achieveGoal/routes'
import setupConfirmAchieveGoalRoutes from './confirmAchieveGoal/routes'
import setupUpdateGoalRoutes from './update-goal/routes'
import setupViewGoalDetailsRoutes from './viewGoalDetails/routes'
import setupPlanHistoryRoutes from './plan-history/routes'
import setupReAddGoalRoutes from './reAddGoal/routes'
import setupUpdateAgreePlanRoutes from './update-agree-plan/routes'

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

  setupAboutPersonRoutes(router)
  setupCreateGoalRoutes(router, services)
  setupRemoveGoalRoutes(router)
  setupChangeGoalRoutes(router, services)
  setupViewGoalDetailsRoutes(router)
  setupAchieveGoalRoutes(router)
  setupConfirmAchieveGoalRoutes(router)
  setupAddStepsRoutes(router)
  setupUpdateGoalRoutes(router, services)
  setupReferenceDataRoutes(router, services)
  setupPlanOverviewRoutes(router)
  setupAgreePlanRoutes(router)
  setupPlanHistoryRoutes(router)
  setupReAddGoalRoutes(router)
  setupUpdateAgreePlanRoutes(router)
  return router
}
