import { Router } from 'express'
import URLs from '../URLs'
import AgreePlanController from './AgreePlanController'

export default function setupAgreePlanRoutes(router: Router) {
  const controller = new AgreePlanController()

  router.get(URLs.AGREE_PLAN, controller.get)
  router.post(URLs.AGREE_PLAN, controller.post)
}
