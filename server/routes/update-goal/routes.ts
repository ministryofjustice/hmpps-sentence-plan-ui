import { Router } from 'express'
import URLs from '../URLs'
import UpdateGoalController from './UpdateGoalController'
import { Services } from '../../services'

export default function setupUpdateGoalRoutes(router: Router, { referentialDataService }: Services) {
  const controller = new UpdateGoalController(referentialDataService)

  router.get(URLs.UPDATE_GOAL, controller.get)
  router.post(URLs.UPDATE_GOAL, controller.post)
}
