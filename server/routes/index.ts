import { type RequestHandler, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import { areasData } from '../data/ui/areas'
import { Page } from '../services/auditService'
import setupHelloWorldRoutes from './helloWorld/routes'
import setupCreateGoalRoutes from './createGoal/routes'
import setupConfirmGoalRoutes from './confirmGoal/routes'
// eslint-disable-next-line @typescript-eslint/no-unused-vars

export default function routes(services: Services): Router {
  const router = Router()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/', async (req, res, next) => {
    await services.auditService.logPageView(Page.EXAMPLE_PAGE, {
      who: res.locals.user?.username,
      correlationId: req.id,
    })
    const rowsData = areasData.map(area => [
      {
        html: `<p>${area.name}</p> <a href=create-goal/${area.url}  draggable="false" >Create goal</a>
      `,
      },
      { html: "<span class='goal-count'>0</span>" },
    ])
    res.render('pages/index', { rowsData })
  })

  setupHelloWorldRoutes(router, services)
  setupCreateGoalRoutes(router, services)
  setupConfirmGoalRoutes(router, services)

  return router
}
