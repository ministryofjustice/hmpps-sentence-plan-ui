import { Router } from 'express'
import type { Services } from '../../services'
import URLs from '../URLs'
import PlanSummaryController from './PlanSummaryController'

export default function setupPlanSummaryRoutes(router: Router, { infoService, goalService }: Services) {
  const controller = new PlanSummaryController(infoService, goalService)

  router.get(URLs.PLAN_SUMMARY, controller.get)
  router.post(URLs.VALIDATE_PLAN, controller.validatePlanForAgreement)
  router.get(URLs.GOALS_ORDER, controller.reorderGoals)
}
