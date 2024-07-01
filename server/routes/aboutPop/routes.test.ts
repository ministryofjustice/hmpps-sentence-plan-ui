import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes } from '../testutils/appSetup'
import locale from './locale.json'
import URLs from '../URLs'
import testReferenceData from '../../testutils/data/referenceData'
import testPopData from '../../testutils/data/popData'
import ReferentialDataService from '../../services/sentence-plan/referentialDataService'
import InfoService from '../../services/sentence-plan/infoService'
import { roSHData } from '../../testutils/data/roshData'
import handoverData from '../../testutils/data/handoverData'

jest.mock('../../services/sentence-plan/referentialDataService', () => {
  return jest.fn().mockImplementation(() => ({
    getAreasOfNeedQuestionData: jest.fn().mockResolvedValue([
      {
        id: testReferenceData.AreasOfNeed[0].id,
        Name: testReferenceData.AreasOfNeed[0].Name,
        active: testReferenceData.AreasOfNeed[0].active,
      },
    ]),
    getReferenceData: jest.fn().mockResolvedValue(testReferenceData),
  }))
})
jest.mock('../../services/sentence-plan/infoService', () => {
  return jest.fn().mockImplementation(() => ({
    getPopData: jest.fn().mockResolvedValue(testPopData),
    getRoSHData: jest.fn().mockResolvedValue(roSHData),
  }))
})
jest.mock('../../services/handover/handoverContextService', () => {
  return jest.fn().mockImplementation(() => ({
    getContext: jest.fn().mockResolvedValue(handoverData),
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

describe(`GET ${URLs.ABOUT_POP}`, () => {
  it('should render about pop page', () => {
    return request(app)
      .get(URLs.ABOUT_POP)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain(locale.en.title.replace('{POP_NAME}', testPopData.givenName))
      })
  })
})
