import { NextFunction, Request, Response } from 'express'
import testPlan from '../../testutils/data/planData'
import mockReq from '../../testutils/preMadeMocks/mockReq'
import mockRes from '../../testutils/preMadeMocks/mockRes'
import locale from './locale.json'
import testHandoverContext from '../../testutils/data/handoverData'
import ConfirmAchieveGoalController from './ConfirmAchieveGoalController'
import { testGoal } from '../../testutils/data/goalData'
import { GoalStatus } from '../../@types/GoalType'
import runMiddlewareChain from '../../testutils/runMiddlewareChain'

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
    getPlanVersionNumber: jest.fn().mockReturnValue(testPlan),
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
    getPlanByUuidAndVersionNumber: jest.fn().mockResolvedValue(testPlan),
  }))
})

describe('AchieveGoalController', () => {
  let controller: ConfirmAchieveGoalController
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
    req = mockReq()
    res = mockRes()
    next = jest.fn()

    controller = new ConfirmAchieveGoalController()
  })

  describe('get', () => {
    it('should render OK', async () => {
      await runMiddlewareChain(controller.get, req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/confirm-if-achieved', viewData)
    })

    it('should render with validation errors', async () => {
      const errors = {
        body: { 'goal-achievement-helped': { maxLength: true }, 'is-goal-achieved-radio': { isNotEmpty: true } },
        params: {},
        query: {},
      }
      req.errors = errors
      const expectedViewData = {
        ...viewData,
        errors,
      }

      await runMiddlewareChain(controller.get, req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/confirm-if-achieved', expectedViewData)
    })
  })

  describe('post', () => {
    it('should mark goal as achieved with optional note details', async () => {
      req.params = {
        uuid: 'some-uuid',
        'goal-achievement-helped': 'Detail on how this goal helped',
      }
      req.body['is-goal-achieved-radio'] = 'yes'
      req.body['goal-achievement-helped'] = 'Note body'

      req.method = 'POST'

      const expectedNote = 'Note body'

      await runMiddlewareChain(controller.post, req, res, next)

      expect(req.services.goalService.achieveGoal).toHaveBeenCalledWith(expectedNote, 'some-uuid')
      expect(res.redirect).toHaveBeenCalledWith('/plan?type=achieved&status=achieved')
      expect(next).not.toHaveBeenCalled()
    })
  })
})
