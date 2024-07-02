import testPlan from '../testutils/data/planData'
import mockReq from '../testutils/preMadeMocks/mockReq'
import SessionService from './sessionService'
import testHandoverContext from '../testutils/data/handoverData'
import PlanService from './sentence-plan/planService'
import HandoverContextService from './handover/handoverContextService'

jest.mock('./sentence-plan/planService', () => {
  return jest.fn().mockImplementation(() => ({
    getPlanByOasysAssessmentPk: jest.fn(),
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
      planServiceMock.getPlanByOasysAssessmentPk.mockResolvedValue(testPlan)

      await sessionService.setupSession()

      expect(requestMock.session.handover).toEqual(testHandoverContext)
      expect(requestMock.session.plan).toEqual(testPlan)
    })

    it('should throw if either getContext or getPlanByOasysAssessmentPk fails', async () => {
      handoverContextServiceMock.getContext.mockRejectedValue('getContext')
      planServiceMock.getPlanByOasysAssessmentPk.mockRejectedValue('getPlanByOasysAssessmentPk')

      await expect(sessionService.setupSession()).rejects.toThrow('getContext')

      handoverContextServiceMock.getContext.mockResolvedValue(testHandoverContext)

      await expect(sessionService.setupSession()).rejects.toThrow('getPlanByOasysAssessmentPk')
    })
  })

  describe('getOasysAssessmentPk', () => {
    it('should get OASys assessment PK from session', async () => {
      requestMock.session = {
        handover: testHandoverContext,
      }

      expect(sessionService.getOasysAssessmentPk()).toBe(testHandoverContext.sentencePlanContext.oasysAssessmentPk)
    })
  })

  describe('getPlanUUID', () => {
    it('should get plan UUID from session', async () => {
      requestMock.session = {
        plan: testPlan,
      }

      expect(sessionService.getPlanUUID()).toBe(testPlan.uuid)
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
