import { NextFunction, Request, Response } from 'express'
import ViewGoalDetailsController from './ViewGoalDetailsController'
import mockReq from '../../testutils/preMadeMocks/mockReq'
import mockRes from '../../testutils/preMadeMocks/mockRes'
import locale from './locale.json'
import { testGoal } from '../../testutils/data/goalData'
import URLs from '../URLs'
import { Goal, GoalStatus } from '../../@types/GoalType'
import runMiddlewareChain from '../../testutils/runMiddlewareChain'
import HandoverContextService from '../../services/handover/handoverContextService'
import PlanService from '../../services/sentence-plan/planService'
import SessionService from '../../services/sessionService'
import { AuditEvent } from '../../services/auditService'

jest.mock('../../services/auditService')

jest.mock('../../middleware/authorisationMiddleware', () => ({
  requireAccessMode: jest.fn(() => (req: Request, res: Response, next: NextFunction) => {
    return next()
  }),
}))

jest.mock('../../services/sentence-plan/goalService', () => {
  return jest.fn().mockImplementation(() => ({
    getGoal: jest.fn().mockResolvedValue(testGoal),
  }))
})

describe('ViewGoalDetailsController', () => {
  let controller: ViewGoalDetailsController

  let req: Request
  let res: Response
  let next: NextFunction

  let handoverContextServiceMock: jest.Mocked<HandoverContextService>
  let planServiceMock: jest.Mocked<PlanService>
  let sessionService: SessionService

  const viewData = {
    locale: locale.en,
    data: {
      goal: testGoal,
      returnLink: URLs.PLAN_OVERVIEW,
    },
    errors: {},
  }

  beforeEach(() => {
    req = mockReq({
      params: { uuid: testGoal.uuid },
    })
    res = mockRes()
    next = jest.fn()

    handoverContextServiceMock = new HandoverContextService(null) as jest.Mocked<HandoverContextService>
    planServiceMock = new PlanService(null) as jest.Mocked<PlanService>
    sessionService = new SessionService(req, handoverContextServiceMock, planServiceMock)
    sessionService.setReturnLink(URLs.PLAN_OVERVIEW)

    req.services.sessionService = sessionService

    controller = new ViewGoalDetailsController()
  })

  describe('get', () => {
    test.each([
      [GoalStatus.ACHIEVED, URLs.PLAN_OVERVIEW],
      [GoalStatus.REMOVED, `/view-removed-goal/${testGoal.uuid}`],
    ])('should render without validation errors for %s', async (status, returnLink) => {
      const goal: Goal = { ...testGoal, status }
      req.services.goalService.getGoal = jest.fn().mockResolvedValue(goal)

      const viewDataPermittedStatus = {
        ...viewData,
        data: {
          goal,
          returnLink: URLs.PLAN_OVERVIEW,
        },
      }

      await runMiddlewareChain(controller.get, req, res, next)

      expect(sessionService.getReturnLink()).toBe(returnLink)
      expect(res.render).toHaveBeenCalledWith('pages/view-goal-details', viewDataPermittedStatus)
      expect(req.services.auditService.send).toHaveBeenCalledWith(AuditEvent.VIEW_GOAL_DETAILS, {
        goalStatus: status,
        goalUUID: 'a-un1qu3-t3st-Uu1d',
      })
    })

    it('should not render when Goal is not Achieved or Removed', async () => {
      await runMiddlewareChain(controller.get, req, res, next)

      expect(res.render).not.toHaveBeenCalledWith('pages/view-goal-details', viewData)
      expect(req.services.auditService.send).not.toHaveBeenCalled()
    })
  })
})
