import { Router } from 'express'
import URLs from '../URLs'
import UnsavedInformationDeletedController from "./UnsavedInformationDeletedController";

export default function setupUnsavedInformationDeletedRoutes(router: Router) {
  const controller = new UnsavedInformationDeletedController()
  router.get(URLs.UNSAVED_INFORMATION_DELETED, controller.get)
}
