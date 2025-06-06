import { Router } from 'express'
import URLs from '../URLs'
import UpdateAgreePlanController from './UpdateAgreePlanController'

export default function setupUpdateAgreePlanRoutes(router: Router) {
  const controller = new UpdateAgreePlanController()

  router.get(URLs.UPDATE_AGREE_PLAN, controller.get)
  router.post(URLs.UPDATE_AGREE_PLAN, controller.post)
}
