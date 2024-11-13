import { Router } from 'express'
import URLs from '../URLs'
import PlanHistoryController from './PlanHistoryController'

export default function setupPlanHistoryRoutes(router: Router) {
  const controller = new PlanHistoryController()

  router.get(URLs.PLAN_HISTORY, controller.get)
}
