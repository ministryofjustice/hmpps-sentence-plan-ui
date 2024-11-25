import { Router } from 'express'
import AboutPersonController from './AboutPersonController'
import URLs from '../URLs'

export default function setupAboutPopRoutes(router: Router) {
  const controller = new AboutPersonController()

  router.get(URLs.ABOUT_PERSON, controller.get)
}
