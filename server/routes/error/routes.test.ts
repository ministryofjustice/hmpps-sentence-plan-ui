import type { Express } from 'express'
import request from 'supertest'
import { NextFunction, Request, Response } from 'express'
import createHttpError from 'http-errors'
import { appWithAllRoutes } from '../testutils/appSetup'
import URLs from '../URLs'
import handoverData from '../../testutils/data/handoverData'
import localeUnauthorized from './locale-unauthorized.json'
import localeForbidden from './locale-forbidden.json'
import localeBadRequest from './locale-bad-request.json'
import localeServiceFault from './locale-service-fault.json'

const mockGet = jest.fn()
const mockPost = jest.fn()

jest.mock('../../services/sessionService', () => {
  return jest.fn().mockImplementation(() => ({
    getSubjectDetails: jest.fn().mockReturnValue(handoverData.subject),
  }))
})

jest.mock('../agree-plan/AgreePlanController', () => {
  return jest.fn().mockImplementation(() => {
    return {
      get: mockGet,
      post: mockPost,
    }
  })
})

const setMockError = (method: 'get' | 'post', error: any) => {
  if (method === 'get') {
    mockGet.mockImplementation(async (req: Request, res: Response, next: NextFunction) => next(error))
  } else if (method === 'post') {
    mockPost.mockImplementation(async (req: Request, res: Response, next: NextFunction) => next(error))
  }
}

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: true })
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('Error Handling', () => {
  it('Should render unauthorized error page (401)', async () => {
    setMockError('get', createHttpError(401))

    await request(app)
      .get(URLs.AGREE_PLAN)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain(localeUnauthorized.en.mainHeading.title)
        expect(res.status).toEqual(401)
        expect(res.text).not.toContain('UnauthorizedError: Unauthorized')
      })
  })

  it('Should render forbidden error page (403)', async () => {
    setMockError('get', createHttpError(403))

    await request(app)
      .get(URLs.AGREE_PLAN)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain(localeForbidden.en.mainHeading.title)
        expect(res.status).toEqual(403)
        expect(res.text).not.toContain('ForbiddenError: Forbidden')
      })
  })

  it('Should handle POST with bad request (400)', async () => {
    setMockError('post', createHttpError(400))

    await request(app)
      .post(URLs.AGREE_PLAN)
      .send({})
      .expect(res => {
        expect(res.text).toContain(localeBadRequest.en.mainHeading.title)
        expect(res.status).toEqual(400)
        expect(res.text).not.toContain('BadRequestError: Bad Request')
      })
  })

  it('Should handle server error (500)', async () => {
    setMockError('get', createHttpError(500))

    await request(app)
      .get(URLs.AGREE_PLAN)
      .expect(500)
      .expect(res => {
        expect(res.text).toContain(localeServiceFault.en.mainHeading.title)
        expect(res.text).not.toContain('InternalServerError: Internal Server Error')
      })
  })

  it('Should handle server error (500) and print stack trace in non-production', async () => {
    setMockError('get', createHttpError(500))

    await request(appWithAllRoutes({ production: false }))
      .get(URLs.AGREE_PLAN)
      .expect(500)
      .expect(res => {
        expect(res.text).toContain(localeServiceFault.en.mainHeading.title)
        expect(res.text).toContain('InternalServerError: Internal Server Error')
      })
  })
})
