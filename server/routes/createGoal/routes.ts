import { Router } from 'express'
import type { Services } from '../../services'
import CreateGoalController from './CreateGoalController'
import URLs from '../URLs'
import CreateGoalPostModel from './models/CreateGoalPostModel'
import validate from '../../middleware/validationMiddleware'

export default function setupCreateGoalRoutes(
  router: Router,
  { referentialDataService, infoService, noteService, goalService }: Services,
) {
  const controller = new CreateGoalController(referentialDataService, infoService, noteService, goalService)

  router.get(URLs.CREATE_GOAL, controller.get)
  router.post(URLs.CREATE_GOAL, validate({ body: CreateGoalPostModel }), controller.post)
}
