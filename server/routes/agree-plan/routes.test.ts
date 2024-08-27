import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes } from '../testutils/appSetup'
import locale from './locale.json'
import URLs from '../URLs'
import testPopData from '../../testutils/data/popData'
import ReferentialDataService from '../../services/sentence-plan/referentialDataService'
import InfoService from '../../services/sentence-plan/infoService'
import { roSHData } from '../../testutils/data/roshData'
import handoverData from '../../testutils/data/handoverData'

jest.mock('../../services/sentence-plan/infoService', () => {
  return jest.fn().mockImplementation(() => ({
    getPopData: jest.fn().mockResolvedValue(testPopData),
    getRoSHData: jest.fn().mockResolvedValue(roSHData),
  }))
})

jest.mock('../../services/sessionService', () => {
  return jest.fn().mockImplementation(() => ({
    getPlanUUID: jest.fn().mockReturnValue('9506fba0-d2c7-4978-b3fc-aefd86821844'),
    getSubjectDetails: jest.fn().mockReturnValue(handoverData.subject),
  }))
})

let app: Express
const referentialDataService = new ReferentialDataService() as jest.Mocked<ReferentialDataService>
const infoService = new InfoService(null) as jest.Mocked<InfoService>

beforeEach(() => {
  app = appWithAllRoutes({
    services: {
      referentialDataService,
      infoService,
    },
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe(`GET ${URLs.AGREE_PLAN}`, () => {
  it('should render agree plan page', () => {
    return request(app)
      .get(URLs.AGREE_PLAN)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain(
          `${locale.en.mainHeading.title.replace('{{ subject.givenName }}', testPopData.givenName)}`,
        )
      })
  })
})
