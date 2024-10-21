import { Router } from 'express'
import URLs from '../URLs'
import ViewAchievedGoalController from './ViewAchievedGoalController'

export default function setupViewAchievedGoalRoutes(router: Router) {
  const controller = new ViewAchievedGoalController()

  router.get(URLs.VIEW_ACHIEVED_GOAL, controller.get)
}
