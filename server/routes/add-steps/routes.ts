import { Router } from 'express'
import AddStepsController from './AddStepsController'
import URLs from '../URLs'

export default function setupAddStepsRoutes(router: Router) {
  const controller = new AddStepsController()
  router.get(URLs.ADD_STEPS, controller.get)
  router.post(URLs.ADD_STEPS, controller.post)
}
