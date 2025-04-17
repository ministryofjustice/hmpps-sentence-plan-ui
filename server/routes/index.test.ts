import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes, user } from './testutils/appSetup'
import URLs from './URLs'

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    services: {},
    userSupplier: () => user,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /', () => {
  it('should render index page', () => {
    return request(app)
      .get('/')
      .expect('Location', URLs.PLAN_OVERVIEW)
      .expect(res => {
        expect(302)
      })
  })
})
