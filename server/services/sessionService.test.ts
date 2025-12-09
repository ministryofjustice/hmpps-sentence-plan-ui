import testPlan from '../testutils/data/planData'
import mockReq from '../testutils/preMadeMocks/mockReq'
import SessionService from './sessionService'
import testHandoverContext from '../testutils/data/handoverData'
import PlanService from './sentence-plan/planService'
import HandoverContextService from './handover/handoverContextService'
import popData from '../testutils/data/popData'
import createUserToken from '../testutils/createUserToken'
import { AuthType } from '../@types/SessionType'

jest.mock('./sentence-plan/planService', () => {
  return jest.fn().mockImplementation(() => ({
    getPlanByUuid: jest.fn(),
    getPlanByUuidAndVersionNumber: jest.fn(),
    associate: jest.fn(),
    getPlanByCrn: jest.fn(),
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

  describe('setupSessionFromHandover', () => {
    it('should set up session with handover and plan', async () => {
      handoverContextServiceMock.getContext.mockResolvedValue(testHandoverContext)
      planServiceMock.getPlanByUuidAndVersionNumber.mockResolvedValue(testPlan)
      planServiceMock.associate.mockResolvedValue(testPlan)
      requestMock.services = { planService: planServiceMock }

      await sessionService.setupSessionFromHandover()

      expect(requestMock.session.principal).toEqual({
        ...testHandoverContext.principal,
        authType: AuthType.OASYS,
      })
      expect(requestMock.session.subject).toEqual(testHandoverContext.subject)
      expect(requestMock.session.criminogenicNeeds).toEqual(testHandoverContext.criminogenicNeedsData)
      expect(requestMock.session.plan).toEqual({
        id: testHandoverContext.sentencePlanContext.planId,
        version: testHandoverContext.sentencePlanContext.planVersion,
      })
    })
  })

  describe('getPlanUUID', () => {
    it('should get plan UUID from session', async () => {
      requestMock.session = {
        plan: {
          id: testHandoverContext.sentencePlanContext.planId,
          version: testHandoverContext.sentencePlanContext.planVersion,
        },
      }

      expect(sessionService.getPlanUUID()).toBe(testHandoverContext.sentencePlanContext.planId)
    })
  })

  describe('getPrincipalDetails', () => {
    it('should get principal details from session', async () => {
      requestMock.session = {
        principal: testHandoverContext.principal,
      }
      expect(sessionService.getPrincipalDetails()).toBe(testHandoverContext.principal)
    })
  })

  describe('getSubjectDetails', () => {
    it('should get subject details from session', async () => {
      requestMock.session = {
        subject: testHandoverContext.subject,
      }
      expect(sessionService.getSubjectDetails()).toBe(testHandoverContext.subject)
    })
  })

  describe('setupPrincipalFromAuth', () => {
    it('should set up principal details from auth token', async () => {
      const token = createUserToken(['ROLE_SENTENCE_PLAN'])

      await sessionService.setupPrincipalFromAuth(token)

      expect(requestMock.session.principal).toEqual({
        identifier: 'a23ccacf-7160-4431-9b4d-c560be9c9f5c',
        displayName: 'Dr. Benjamin Runolfsdottir',
        accessMode: 'READ_WRITE',
        authType: AuthType.HMPPS_AUTH,
      })
    })

    it('should throw error if token is invalid', async () => {
      const invalidToken = 'invalid-token'

      await expect(sessionService.setupPrincipalFromAuth(invalidToken)).rejects.toThrow()
    })
  })

  describe('setupSessionFromAuth', () => {
    it('should set up session with subject and plan details', async () => {
      const crn = 'X775086'
      planServiceMock.getPlanByCrn.mockResolvedValue({
        uuid: testPlan.uuid,
        currentVersion: testPlan,
      } as any)
      requestMock.services.infoService.getPopData = jest.fn().mockResolvedValue(popData)
      requestMock.user = {
        token: createUserToken([]),
      }

      await sessionService.setupSessionFromAuth(crn)

      expect(requestMock.session.subject).toEqual({
        crn: popData.crn,
        pnc: 'UNKNOWN PNC',
        givenName: popData.firstName,
        familyName: popData.lastName,
        dateOfBirth: popData.doB,
        gender: 9,
        location: 'COMMUNITY',
      })
      expect(requestMock.session.plan).toEqual({
        id: testPlan.uuid,
        version: null,
      })
    })

    it('should handle when delius data is not found', async () => {
      const crn = 'X775086'
      requestMock.services.infoService.getPopData = jest.fn().mockRejectedValue(new Error('Not found'))

      await expect(sessionService.setupSessionFromAuth(crn)).rejects.toThrow('Not found')
    })

    it('should handle when plan is not found', async () => {
      const crn = 'X775086'
      planServiceMock.getPlanByCrn.mockRejectedValue(new Error('Plan not found'))
      requestMock.services.infoService.getPopData = jest.fn().mockResolvedValue(popData)

      await expect(sessionService.setupSessionFromAuth(crn)).rejects.toThrow('Plan not found')
    })
  })
})
