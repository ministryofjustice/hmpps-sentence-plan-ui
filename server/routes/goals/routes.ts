import { Router } from 'express'
import type { Services } from '../../services'
import URLs from '../URLs'
import GoalsController from './GoalsController'

export default function setupGoalsRoutes(router: Router, { infoService, goalService }: Services) {
  const controller = new GoalsController(infoService, goalService)

  router.get(URLs.GOALS, controller.get)
  router.get(URLs.GOALS_ORDER, controller.reorder)
}
