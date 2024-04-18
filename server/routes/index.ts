import { type RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import { areasData } from '../data/ui/areas'
import { Page } from '../services/auditService'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function routes({ auditService, helloWorldService }: Services): Router {
  const router = Router()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/', async (req, res, next) => {
    await auditService.logPageView(Page.EXAMPLE_PAGE, { who: res.locals.user?.username, correlationId: req.id })
    const rowsData = areasData.map(area => [
      {
        html: `<p>${area.name}</p> <a href="goals/${area.url}"  draggable="false" >Create goal</a>
      `,
      },
      { html: "<span class='goal-count'>0</span>" },
    ])
    res.render('pages/index', { rowsData })
  })

  get('/hello/:q', async (req, res, next) => {
    const { q } = req.params
    const response = await helloWorldService.helloWorld(q)
    res.render('pages/hello-world', { q, response })
  })
  return router
}
