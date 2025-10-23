import { Router } from 'express'
import URLs from '../URLs'
import ViewPreviousVersionController from './ViewPreviousVersionController'

export default function setupViewPreviousVersionRoutes(router: Router) {
  const controller = new ViewPreviousVersionController()

  router.get(URLs.VIEW_PREVIOUS_VERSION, controller.get)
}
