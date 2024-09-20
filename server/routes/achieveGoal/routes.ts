import { Router } from 'express'
import URLs from '../URLs'
import AchieveGoalController from './AchieveGoalController'

export default function setupAchieveGoalRoutes(router: Router) {
  const controller = new AchieveGoalController()

  router.get(URLs.ACHIEVE_GOAL, controller.get)
  router.post(URLs.ACHIEVE_GOAL, controller.post)
}
