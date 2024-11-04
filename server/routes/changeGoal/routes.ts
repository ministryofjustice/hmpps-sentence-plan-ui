import { Router } from 'express'
import type { Services } from '../../services'
import URLs from '../URLs'
import ChangeGoalController from './ChangeGoalController'

export default function setupChangeGoalRoutes(router: Router, { referentialDataService }: Services) {
  const controller = new ChangeGoalController(referentialDataService)

  router.get(URLs.CHANGE_GOAL, controller.get)
  router.post(URLs.CHANGE_GOAL, controller.post)
}
