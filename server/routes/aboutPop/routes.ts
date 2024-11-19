import { Router } from 'express'
import AboutPopController from './AboutPopController'
import URLs from '../URLs'

export default function setupAboutPopRoutes(router: Router) {
  const controller = new AboutPopController()

  router.get(URLs.ABOUT_POP, controller.get)
}
