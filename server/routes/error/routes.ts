import ErrorController from './ErrorController'

export default function setupErrorRoute(production?: boolean) {
  const controller = new ErrorController(production)
  return controller.any
}
