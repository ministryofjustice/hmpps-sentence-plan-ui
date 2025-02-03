import { Router } from 'express'
import URLs from '../URLs'
import ConfirmAchieveGoalController from './ConfirmAchieveGoalController'

export default function setupConfirmAchieveGoalRoutes(router: Router) {
  const controller = new ConfirmAchieveGoalController()

  router.get(URLs.CONFIRM_ACHIEVE_GOAL, controller.get)
  router.post(URLs.CONFIRM_ACHIEVE_GOAL, controller.post)
}
