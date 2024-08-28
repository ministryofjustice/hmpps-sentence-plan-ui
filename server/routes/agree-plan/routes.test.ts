import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes } from '../testutils/appSetup'
import locale from './locale.json'
import URLs from '../URLs'
import testPopData from '../../testutils/data/popData'
import ReferentialDataService from '../../services/sentence-plan/referentialDataService'
import testPlan from '../../testutils/data/planData'
import testHandoverContext from '../../testutils/data/handoverData'
import PlanService from '../../services/sentence-plan/planService'

jest.mock('../../services/sentence-plan/planService', () => {
  return jest.fn().mockImplementation(() => ({
    agreePlan: jest.fn().mockResolvedValue(testPlan),
    getPlanByUuid: jest.fn().mockResolvedValue(testPlan),
  }))
})

jest.mock('../../services/sessionService', () => {
  return jest.fn().mockImplementation(() => ({
    getPlanUUID: jest.fn().mockReturnValue(testPlan.uuid),
    getPrincipalDetails: jest.fn().mockReturnValue(testHandoverContext.principal),
    getSubjectDetails: jest.fn().mockReturnValue(testHandoverContext.subject),
  }))
})

let app: Express
const referentialDataService = new ReferentialDataService() as jest.Mocked<ReferentialDataService>
const planService = new PlanService(null) as jest.Mocked<PlanService>

beforeEach(() => {
  app = appWithAllRoutes({
    services: {
      referentialDataService,
      planService,
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
