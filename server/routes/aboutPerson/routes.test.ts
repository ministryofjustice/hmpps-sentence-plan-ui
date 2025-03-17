import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes } from '../testutils/appSetup'
import locale from './locale.json'
import URLs from '../URLs'
import testPopData from '../../testutils/data/popData'
import ReferentialDataService from '../../services/sentence-plan/referentialDataService'
import { AreaOfNeed } from '../../testutils/data/referenceData'
import testPlan from '../../testutils/data/planData'
import testHandoverContext from '../../testutils/data/handoverData'
import { crimNeedsSubset, incompleteAssessmentData } from '../../testutils/data/testAssessmentData'
import { AccessMode } from '../../@types/Handover'

jest.mock('../../services/sentence-plan/referentialDataService', () => {
  return jest.fn().mockImplementation(() => ({
    getAreasOfNeed: jest.fn().mockResolvedValue(AreaOfNeed),
  }))
})

jest.mock('../../services/sentence-plan/assessmentService', () => {
  return jest.fn().mockImplementation(() => ({
    getAssessmentByUuid: jest.fn().mockResolvedValue(incompleteAssessmentData),
  }))
})

jest.mock('../../services/sentence-plan/infoService', () => {
  return jest.fn().mockImplementation(() => ({
    getPopData: jest.fn().mockResolvedValue(testPopData),
  }))
})

jest.mock('../../services/sentence-plan/planService', () => {
  return jest.fn().mockImplementation(() => ({
    getPlanByUuid: jest.fn().mockResolvedValue(testPlan),
  }))
})

jest.mock('../../services/sessionService', () => {
  return jest.fn().mockImplementation(() => ({
    getPlanUUID: jest.fn().mockReturnValue(testPlan.uuid),
    getPrincipalDetails: jest.fn().mockReturnValue(testHandoverContext.principal),
    getSubjectDetails: jest.fn().mockReturnValue(testHandoverContext.subject),
    getCriminogenicNeeds: jest.fn().mockReturnValue(crimNeedsSubset),
    getOasysReturnUrl: jest.fn().mockReturnValue('http://mock-return-url'),
    getAccessMode: jest.fn().mockReturnValue(AccessMode.READ_WRITE),
    setReturnLink: jest.fn(),
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

describe(`GET ${URLs.ABOUT_PERSON}`, () => {
  it('should render About page', () => {
    return request(app)
      .get(URLs.ABOUT_PERSON)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain(
          locale.en.mainHeading.title.replace('{{ subject.givenName }}', testPopData.givenName),
        )
      })
  })
})
