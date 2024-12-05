import testPlan from '../testutils/data/planData'
import mockReq from '../testutils/preMadeMocks/mockReq'
import SessionService from './sessionService'
import testHandoverContext from '../testutils/data/handoverData'
import PlanService from './sentence-plan/planService'
import HandoverContextService from './handover/handoverContextService'

jest.mock('./sentence-plan/planService', () => {
  return jest.fn().mockImplementation(() => ({
    getPlanByUuid: jest.fn(),
    getPlanByUuidAndVersionNumber: jest.fn(),
  }))
})
jest.mock('./handover/handoverContextService', () => {
  return jest.fn().mockImplementation(() => ({
    getContext: jest.fn(),
  }))
})

describe('SessionService', () => {
  let requestMock: any
  let handoverContextServiceMock: jest.Mocked<HandoverContextService>
  let planServiceMock: jest.Mocked<PlanService>
  let sessionService: SessionService

  beforeEach(() => {
    requestMock = mockReq()
    handoverContextServiceMock = new HandoverContextService(null) as jest.Mocked<HandoverContextService>
    planServiceMock = new PlanService(null) as jest.Mocked<PlanService>
    sessionService = new SessionService(requestMock, handoverContextServiceMock, planServiceMock)
  })

  describe('setupSession', () => {
    it('should set up session with handover and plan', async () => {
      handoverContextServiceMock.getContext.mockResolvedValue(testHandoverContext)
      planServiceMock.getPlanByUuidAndVersionNumber.mockResolvedValue(testPlan)

      await sessionService.setupSession()

      expect(requestMock.session.handover).toEqual(testHandoverContext)
      expect(requestMock.session.plan).toEqual(testPlan)
    })
  })

  describe('getPlanUUID', () => {
    it('should get plan UUID from session', async () => {
      requestMock.session = {
        handover: testHandoverContext,
      }

      expect(sessionService.getPlanUUID()).toBe(testHandoverContext.sentencePlanContext.planId)
    })
  })

  describe('getPrincipalDetails', () => {
    it('should get principal details from session', async () => {
      requestMock.session = {
        handover: testHandoverContext,
      }
      expect(sessionService.getPrincipalDetails()).toBe(testHandoverContext.principal)
    })
  })

  describe('getSubjectDetails', () => {
    it('should get subject details from session', async () => {
      requestMock.session = {
        handover: testHandoverContext,
      }
      expect(sessionService.getSubjectDetails()).toBe(testHandoverContext.subject)
    })
  })
})
