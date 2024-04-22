import { Router } from 'express'
import type { Services } from '../../services'
import HelloWorldController from './HelloWorldController'

export default function setupHelloWorldRoutes(router: Router, { helloWorldService }: Services) {
  const controller = new HelloWorldController(helloWorldService)

  router.get('/hello/:q', controller.get)
}
