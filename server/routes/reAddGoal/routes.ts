import { Router } from 'express'
import URLs from '../URLs'
import ReAddGoalController from './ReAddGoalController'

export default function setupReAddGoalRoutes(router: Router) {
  const controller = new ReAddGoalController()

  router.get(URLs.RE_ADD_GOAL, controller.get)
  router.post(URLs.RE_ADD_GOAL, controller.post)
}
