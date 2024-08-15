import { Router } from 'express'
import URLs from '../URLs'
import AgreePlanController from './AgreePlanController'
import type { Services } from '../../services'
import validate from '../../middleware/validationMiddleware'
import AgreePlanPostModel from './models/AgreePlanPostModel'

export default function setupAgreePlanRoutes(router: Router, { planService }: Services) {
  const controller = new AgreePlanController(planService)

  router.get(URLs.AGREE_PLAN, controller.get)
  router.post(URLs.AGREE_PLAN, validate({ body: AgreePlanPostModel }), controller.post)
}
