import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes } from '../testutils/appSetup'
import locale from './locale.json'
import URLs from '../URLs'
import testPopData from '../../testutils/data/popData'
import ReferentialDataService from '../../services/sentence-plan/referentialDataService'
import { couldNotAnswerTestPlan } from '../../testutils/data/planData'
import testHandoverContext from '../../testutils/data/handoverData'

jest.mock('../../services/sentence-plan/planService', () => {
  return jest.fn().mockImplementation(() => ({
    agreePlan: jest.fn().mockResolvedValue(couldNotAnswerTestPlan),
    getPlanByUuid: jest.fn().mockResolvedValue(couldNotAnswerTestPlan),
  }))
})

jest.mock('../../services/sessionService', () => {
  return jest.fn().mockImplementation(() => ({
    getPlanUUID: jest.fn().mockReturnValue(couldNotAnswerTestPlan.uuid),
    getPrincipalDetails: jest.fn().mockReturnValue(testHandoverContext.principal),
    getSubjectDetails: jest.fn().mockReturnValue(testHandoverContext.subject),
    getReturnLink: jest.fn().mockReturnValue('/some-return-link'),
    getAccessMode: jest.fn().mockReturnValue('READ_WRITE'),
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

describe(`GET ${URLs.UPDATE_AGREE_PLAN}`, () => {
  it('should render agree plan page', () => {
    return request(app)
      .get(URLs.UPDATE_AGREE_PLAN)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain(
          `${locale.en.mainHeading.title.replace('{{ subject.givenName }}', testPopData.givenName)}`,
        )
      })
  })
})
