import { Router } from 'express'
import type { Services } from '../../services'
import URLs from '../URLs'
import RemoveGoalController from './RemoveGoalController'

export default function setupRemoveGoalRoutes(router: Router, { infoService, goalService }: Services) {
  const controller = new RemoveGoalController(infoService, goalService)

  router.get(URLs.REMOVE_GOAL, controller.get)
  router.post(URLs.REMOVE_GOAL, controller.post)
}
