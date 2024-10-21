import { Router } from 'express'
import URLs from '../URLs'
import PlanOverviewController from './PlanOverviewController'

export default function setupPlanOverviewRoutes(router: Router) {
  const controller = new PlanOverviewController()

  router.get(URLs.PLAN_OVERVIEW, controller.get)
  router.post(URLs.PLAN_OVERVIEW, controller.post)
  router.get(URLs.GOALS_ORDER, controller.reorderGoals)
}
