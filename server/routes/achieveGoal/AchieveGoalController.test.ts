import { NextFunction, Request, Response } from 'express'
import testPlan from '../../testutils/data/planData'
import mockReq from '../../testutils/preMadeMocks/mockReq'
import mockRes from '../../testutils/preMadeMocks/mockRes'
import locale from './locale.json'
import testHandoverContext from '../../testutils/data/handoverData'
import AchieveGoalController from './AchieveGoalController'
import { testGoal } from '../../testutils/data/goalData'
import runMiddlewareChain from '../../testutils/runMiddlewareChain'
import { AuditEvent } from '../../services/auditService'

jest.mock('../../services/auditService')

jest.mock('../../middleware/authorisationMiddleware', () => ({
  requireAccessMode: jest.fn(() => (req: Request, res: Response, next: NextFunction) => {
    return next()
  }),
}))

jest.mock('../../services/sessionService', () => {
  return jest.fn().mockImplementation(() => ({
    getPlanUUID: jest.fn().mockReturnValue(testPlan.uuid),
    getPrincipalDetails: jest.fn().mockReturnValue(testHandoverContext.principal),
    getSubjectDetails: jest.fn().mockReturnValue(testHandoverContext.subject),
    getReturnLink: jest.fn().mockReturnValue('/some-return-link'),
  }))
})

jest.mock('../../services/sentence-plan/goalService', () => {
  return jest.fn().mockImplementation(() => ({
    getGoal: jest.fn().mockReturnValue(testGoal),
    achieveGoal: jest.fn().mockReturnValue(testGoal),
  }))
})

jest.mock('../../services/sentence-plan/planService', () => {
  return jest.fn().mockImplementation(() => ({
    agreePlan: jest.fn().mockResolvedValue(testPlan),
    getPlanByUuid: jest.fn().mockResolvedValue(testPlan),
  }))
})

describe('AchieveGoalController', () => {
  let controller: AchieveGoalController
  let req: Request
  let res: Response
  let next: NextFunction
  const viewData = {
    data: {
      returnLink: '/some-return-link',
      form: {},
      goal: testGoal,
    },
    errors: {},
    locale: locale.en,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    req = mockReq()
    res = mockRes()
    next = jest.fn()

    controller = new AchieveGoalController()
  })

  describe('get', () => {
    it('should render OK', async () => {
      await runMiddlewareChain(controller.get, req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/confirm-achieved-goal', viewData)
      expect(req.services.auditService.send).not.toHaveBeenCalled()
    })

    it('should render with validation errors', async () => {
      const errors = {
        body: { 'goal-achievement-helped': { maxLength: true } },
        params: {},
        query: {},
      }
      req.errors = errors
      const expectedViewData = {
        ...viewData,
        errors,
      }

      await runMiddlewareChain(controller.get, req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/confirm-achieved-goal', expectedViewData)
      expect(req.services.auditService.send).not.toHaveBeenCalled()
    })
  })

  describe('post', () => {
    it('should mark goal as achieved with optional note details', async () => {
      req.params = {
        uuid: 'some-uuid',
        'goal-achievement-helped': 'Detail on how this goal helped',
      }
      req.body['goal-achievement-helped'] = 'Note body'

      req.method = 'POST'

      const expectedNote = 'Note body'

      await runMiddlewareChain(controller.post, req, res, next)

      expect(req.services.goalService.achieveGoal).toHaveBeenCalledWith(expectedNote, 'some-uuid')
      expect(res.redirect).toHaveBeenCalledWith('/plan?type=achieved&status=achieved')
      expect(next).not.toHaveBeenCalled()
      expect(req.services.auditService.send).toHaveBeenCalledWith(AuditEvent.MARK_GOAL_AS_ACHIEVED, {
        goalUUID: 'some-uuid',
      })
    })
  })
})
