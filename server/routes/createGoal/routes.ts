import { Router } from 'express'
import type { Services } from '../../services'
import CreateGoalController from './CreateGoalController'

export default function setupCreateGoalRoutes(
  router: Router,
  { referentialDataService, infoService, noteService }: Services,
) {
  const controller = new CreateGoalController(referentialDataService, infoService, noteService)

  router.get('/create-goal/:areaOfNeed', controller.get)
}
