import { Router } from 'express'
import type { Services } from '../../services'
import StepsController from './StepsController'
import URLs from '../URLs'

export default function setupStepRoutes(router: Router, { stepService }: Services) {
  const controller = new StepsController(stepService)
  router.get(URLs.CREATE_STEP, controller.get)
  router.post(URLs.CREATE_STEP, controller.post)
}
