import { Router } from 'express'
import URLs from '../URLs'
import PreviousVersionsController from './PreviousVersionsController'

export default function setupPreviousVersionsRoutes(router: Router) {
  const controller = new PreviousVersionsController()

  router.get(URLs.PREVIOUS_VERSIONS, controller.get)
}
