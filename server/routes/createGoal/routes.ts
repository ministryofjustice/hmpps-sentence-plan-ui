import { Router } from 'express'
import type { Services } from '../../services'
import CreateGoalController from './CreateGoalController'
import URLs from '../URLs'
import CreateGoalPostModel from './models/CreateGoalPostModel'
import validateRequest from '../../middleware/validationMiddleware'

export default function setupCreateGoalRoutes(router: Router, { referentialDataService, goalService }: Services) {
  const controller = new CreateGoalController(referentialDataService, goalService)

  router.get(URLs.CREATE_GOAL, controller.get)
  router.post(URLs.CREATE_GOAL, validateRequest({ body: CreateGoalPostModel }), controller.post)
}
