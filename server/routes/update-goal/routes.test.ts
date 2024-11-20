import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes } from '../testutils/appSetup'
import URLs from '../URLs'
import testPopData from '../../testutils/data/popData'
import ReferentialDataService from '../../services/sentence-plan/referentialDataService'
import { roSHData } from '../../testutils/data/roshData'
import handoverData from '../../testutils/data/handoverData'
import { testGoal } from '../../testutils/data/goalData'

jest.mock('../../services/sessionService', () => {
  return jest.fn().mockImplementation(() => ({
    getPlanUUID: jest.fn().mockReturnValue('9506fba0-d2c7-4978-b3fc-aefd86821844'),
    getSubjectDetails: jest.fn().mockReturnValue(handoverData.subject),
    getAccessMode: jest.fn().mockReturnValue('READ_WRITE'),
    setReturnLink: jest.fn(),
    getReturnLink: jest.fn().mockReturnValue('/some-return-link'),
  }))
})

jest.mock('../../services/sentence-plan/infoService', () => {
  return jest.fn().mockImplementation(() => ({
    getPopData: jest.fn().mockResolvedValue(testPopData),
    getRoSHData: jest.fn().mockResolvedValue(roSHData),
  }))
})

jest.mock('../../services/sentence-plan/goalService', () => {
  return jest.fn().mockImplementation(() => ({
    getGoal: jest.fn().mockReturnValue(testGoal),
  }))
})

let app: Express
const referentialDataService = new ReferentialDataService() as jest.Mocked<ReferentialDataService>

beforeEach(() => {
  app = appWithAllRoutes({
    services: {
      referentialDataService,
    },
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe(`GET ${URLs.UPDATE_GOAL}`, () => {
  it('should render update goal page', () => {
    return request(app)
      .get(`${URLs.UPDATE_GOAL}?type=current`)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Test goal</h1>')
      })
  })
})
