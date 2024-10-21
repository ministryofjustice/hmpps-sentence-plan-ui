import { Router } from 'express'
import type { Services } from '../../services'
import AboutPopController from './AboutPopController'
import URLs from '../URLs'

export default function setupAboutPopRoutes(router: Router, { referentialDataService }: Services) {
  const controller = new AboutPopController(referentialDataService)

  router.get(URLs.ABOUT_POP, controller.get)
}
