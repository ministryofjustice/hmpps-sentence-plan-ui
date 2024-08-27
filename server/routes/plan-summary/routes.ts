import { Router } from 'express'
import type { Services } from '../../services'
import URLs from '../URLs'
import PlanSummaryController from './PlanSummaryController'

export default function setupPlanSummaryRoutes(router: Router, { planService, goalService }: Services) {
  const controller = new PlanSummaryController(planService, goalService)

  router.get(URLs.PLAN_SUMMARY, controller.get)
  router.post(URLs.PLAN_SUMMARY, controller.post)
  router.get(URLs.GOALS_ORDER, controller.reorderGoals)
}
