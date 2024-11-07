import { Router } from 'express'
import URLs from '../URLs'
import ViewGoalDetailsController from './ViewGoalDetailsController'

export default function setupViewAchievedGoalRoutes(router: Router) {
  const controller = new ViewGoalDetailsController()

  router.get(URLs.VIEW_ACHIEVED_GOAL, controller.get)
  router.get(URLs.VIEW_REMOVED_GOAL, controller.get)
}
