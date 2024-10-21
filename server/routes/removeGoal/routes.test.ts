import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes } from '../testutils/appSetup'
import testPopData from '../../testutils/data/popData'
import ReferentialDataService from '../../services/sentence-plan/referentialDataService'
import { roSHData } from '../../testutils/data/roshData'
import handoverData from '../../testutils/data/handoverData'
import { testGoal } from '../../testutils/data/goalData'
import testPlan, { agreedTestPlan } from '../../testutils/data/planData'

const mockGetPlanUUID = jest.fn().mockReturnValue(testPlan.uuid)
const mockSessionService = jest.fn().mockImplementation(() => ({
  getPlanUUID: mockGetPlanUUID,
  getSubjectDetails: jest.fn().mockReturnValue(handoverData.subject),
  getPrincipalDetails: jest.fn().mockReturnValue(handoverData.principal),
}))

jest.mock('../../services/sessionService', () => {
  return jest.fn().mockImplementation(() => mockSessionService())
})

jest.mock('../../services/sentence-plan/infoService', () => {
  return jest.fn().mockImplementation(() => ({
    getPopData: jest.fn().mockResolvedValue(testPopData),
    getRoSHData: jest.fn().mockResolvedValue(roSHData),
  }))
})

jest.mock('../../services/sentence-plan/goalService', () => {
  return jest.fn().mockImplementation(() => ({
    getGoal: jest.fn().mockResolvedValue(testGoal),
  }))
})

jest.mock('../../services/sentence-plan/planService', () => {
  return jest.fn().mockImplementation(() => ({
    getPlanByUuid: jest.fn().mockImplementation(planUuid => {
      if (planUuid === 'agreed-plan-uuid') {
        return agreedTestPlan
      }
      return testPlan
    }),
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

describe(`GET /confirm-delete-goal`, () => {
  it('Should render delete goal page', () => {
    return request(app)
      .get('/confirm-delete-goal/5ee410e5-6998-44cc-9b26-148627ea8a52')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Confirm you want to delete this goal')
      })
  })
})

describe(`GET /remove-goal`, () => {
  it('Should render remove goal page', () => {
    mockSessionService().getPlanUUID.mockReset()
    mockGetPlanUUID.mockImplementation(() => 'agreed-plan-uuid')

    return request(app)
      .get('/remove-goal/5ee410e5-6998-44cc-9b26-148627ea8a52')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Are you sure you want to remove this goal?')
      })
  })
})
