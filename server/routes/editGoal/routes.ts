import { Router } from 'express'
import type { Services } from '../../services'
import URLs from '../URLs'
import EditGoalController from './EditGoalController'
import validate from '../../middleware/validationMiddleware'
import CreateGoalPostModel from '../createGoal/models/CreateGoalPostModel'

export default function setupEditGoalRoutes(
  router: Router,
  { referentialDataService, noteService, goalService }: Services,
) {
  const controller = new EditGoalController(referentialDataService, noteService, goalService)

  router.get(URLs.EDIT_GOAL, controller.get)
  router.post(URLs.EDIT_GOAL, validate({ body: CreateGoalPostModel }), controller.post)
}
