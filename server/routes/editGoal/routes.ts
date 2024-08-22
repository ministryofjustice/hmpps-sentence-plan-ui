import { Router } from 'express'
import type { Services } from '../../services'
import URLs from '../URLs'
import EditGoalController from './EditGoalController'

export default function setupEditGoalRoutes(router: Router, { referentialDataService, goalService }: Services) {
  const controller = new EditGoalController(referentialDataService, goalService)

  router.get(URLs.EDIT_GOAL, controller.get)
  router.post(URLs.EDIT_GOAL, controller.post)
}
