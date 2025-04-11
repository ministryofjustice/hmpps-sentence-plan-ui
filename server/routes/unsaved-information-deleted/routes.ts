import { Router } from 'express'
import UnsavedInformationDeletedController from './UnsavedInformationDeletedController'
import URLs from '../URLs'

export default function setupUnsavedInformationDeletedControllerRoutes(router: Router) {
  const controller = new UnsavedInformationDeletedController()
  router.get(URLs.UNSAVED_INFORMATION_DELETED, controller.get)
}
