import { Router } from 'express'
import type { Services } from '../../services'
import StepsController from './StepsController'

export default function setupStepRoutes(
  router: Router,
  { stepService, referentialDataService, infoService }: Services,
) {
  const controller = new StepsController(stepService, referentialDataService, infoService)
  router.get('/steps/create', controller.get)
  router.post('/steps/create', controller.post)
}
