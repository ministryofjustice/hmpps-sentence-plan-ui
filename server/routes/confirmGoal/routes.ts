import { Router } from 'express'
import type { Services } from '../../services'
import ConfirmGoalController from './ConfirmGoalController'
import URLs from '../URLs'

export default function setupConfirmGoalRoutes(router: Router, { infoService, goalService, stepService }: Services) {
  const controller = new ConfirmGoalController(infoService, goalService, stepService)

  router.get(URLs.CONFIRM_GOAL, controller.get)
  router.post(URLs.CONFIRM_GOAL, controller.post)
}
