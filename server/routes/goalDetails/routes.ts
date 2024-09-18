import { Router } from 'express'
import URLs from '../URLs'
import GoalDetailsController from './GoalDetailsController'

export default function setupGoalDetailsRoutes(router: Router) {
  const controller = new GoalDetailsController()

  router.get(URLs.VIEW_ACHIEVED_GOAL, controller.get)
}
