import type { Express } from 'express'
import request from 'supertest'
import locale from './locale.json'
import { appWithAllRoutes } from '../testutils/appSetup'
import handoverData from '../../testutils/data/handoverData'

let app: Express

jest.mock('../../services/sessionService', () => {
  return jest.fn().mockImplementation(() => ({
    getSubjectDetails: jest.fn().mockReturnValue(handoverData.subject),
  }))
})

beforeEach(() => {
  app = appWithAllRoutes({})
})

describe('GET 404', () => {
  it('should render Not Found page when requesting a non-matching path', () => {
    return request(app)
      .get('/unknown')
      .expect(404)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain(locale.en.mainHeading.title)
        expect(res.status).toEqual(404)
      })
  })
})
