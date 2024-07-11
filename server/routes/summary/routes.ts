import { Router } from 'express'
import SummaryController from './SummaryController'

export default function setupSummaryRoutes(router: Router) {
  const controller = new SummaryController()
  router.get('/summary', controller.get)
}
