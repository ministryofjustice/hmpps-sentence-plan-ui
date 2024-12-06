import NotFoundController from './NotFoundController'

export default function setupNotFoundRoute() {
  const controller = new NotFoundController()
  return controller.any
}
