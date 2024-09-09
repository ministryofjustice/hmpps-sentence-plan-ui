import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes } from '../testutils/appSetup'
import locale from './locale.json'
import URLs from '../URLs'
import testPopData from '../../testutils/data/popData'
import ReferentialDataService from '../../services/sentence-plan/referentialDataService'
import { roSHData } from '../../testutils/data/roshData'
import handoverData from '../../testutils/data/handoverData'
import { AreaOfNeed } from '../../testutils/data/referenceData'

jest.mock('../../services/sentence-plan/referentialDataService', () => {
  return jest.fn().mockImplementation(() => ({
    getAreasOfNeed: jest.fn().mockResolvedValue(AreaOfNeed),
  }))
})
jest.mock('../../services/sentence-plan/infoService', () => {
  return jest.fn().mockImplementation(() => ({
    getPopData: jest.fn().mockResolvedValue(testPopData),
    getRoSHData: jest.fn().mockResolvedValue(roSHData),
  }))
})
jest.mock('../../services/sessionService', () => {
  return jest.fn().mockImplementation(() => ({
    getSubjectDetails: jest.fn().mockReturnValue(handoverData.subject),
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

describe(`GET ${URLs.ABOUT_POP}`, () => {
  it('should render about pop page', () => {
    return request(app)
      .get(URLs.ABOUT_POP)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain(
          locale.en.mainHeading.title.replace('{{ subject.givenName }}', testPopData.givenName),
        )
      })
  })
})
