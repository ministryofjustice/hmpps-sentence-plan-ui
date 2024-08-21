import { Router } from 'express'
import type { Services } from '../../services'
import AddStepsController from './AddStepsController'
import URLs from '../URLs'

export default function setupAddStepsRoutes(router: Router, { stepService }: Services) {
  const controller = new AddStepsController(stepService)
  router.get(URLs.ADD_STEPS, controller.get)
  router.post(URLs.ADD_STEPS, controller.post)
}
