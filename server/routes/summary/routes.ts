import { Router } from 'express'
import type { Services } from '../../services'
import SummaryController from './SummaryController'

export default function setupSummaryRoutes(router: Router, { infoService }: Services) {
  const controller = new SummaryController(infoService)
  router.get('/summary', controller.get)
}
