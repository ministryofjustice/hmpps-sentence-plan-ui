import { Router } from 'express'
import type { Services } from '../../services'
import URLs from '../URLs'
import EditGoalController from './EditGoalController'
import validate from '../../middleware/validationMiddleware'
import EditGoalPostModel from './models/EditGoalPostModel'

export default function setupEditGoalRoutes(
  router: Router,
  { referentialDataService, goalService }: Services,
) {
  const controller = new EditGoalController(referentialDataService, goalService)

  router.get(URLs.EDIT_GOAL, controller.get)
  router.post(URLs.EDIT_GOAL, validate({ body: EditGoalPostModel }), controller.post)
}
