import { Router } from 'express'
import URLs from '../URLs'
import RemoveGoalController from './RemoveGoalController'

export default function setupRemoveGoalRoutes(router: Router) {
  const controller = new RemoveGoalController()

  router.get(URLs.REMOVE_GOAL, controller.get)
  router.post(URLs.REMOVE_GOAL, controller.post)

  router.get(URLs.DELETE_GOAL, controller.get)
  router.post(URLs.DELETE_GOAL, controller.post)
}
