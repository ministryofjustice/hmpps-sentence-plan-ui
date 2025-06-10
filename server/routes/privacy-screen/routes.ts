import { Router } from 'express'
import URLs from '../URLs'
import PrivacyScreenController from './PrivacyScreenController'

export default function setupPrivacyScreenRoutes(router: Router) {
  const controller = new PrivacyScreenController()

  router.get(URLs.DATA_PRIVACY, controller.get)
  router.post(URLs.DATA_PRIVACY, controller.post)
}
