import { Router } from 'express'
import URLs from '../URLs'
import PlanSummaryController from './PlanSummaryController'

export default function setupPlanSummaryRoutes(router: Router) {
  const controller = new PlanSummaryController()

  router.get(URLs.PLAN_SUMMARY, controller.get)
  router.post(URLs.PLAN_SUMMARY, controller.post)
  router.get(URLs.GOALS_ORDER, controller.reorderGoals)
}
