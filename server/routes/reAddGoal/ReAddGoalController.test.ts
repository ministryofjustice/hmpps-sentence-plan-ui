import { NextFunction, Request, Response } from 'express'
import testPlan from '../../testutils/data/planData'
import mockReq from '../../testutils/preMadeMocks/mockReq'
import mockRes from '../../testutils/preMadeMocks/mockRes'
import locale from './locale.json'
import testHandoverContext from '../../testutils/data/handoverData'
import ReAddGoalController from './ReAddGoalController'
import { testGoal } from '../../testutils/data/goalData'
import { GoalStatus } from '../../@types/GoalType'
import runMiddlewareChain from '../../testutils/runMiddlewareChain'
import { goalStatusToTabName } from '../../utils/utils'

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
    setReturnLink: jest.fn(),
  }))
})

jest.mock('../../services/sentence-plan/goalService', () => {
  return jest.fn().mockImplementation(() => ({
    getGoal: jest.fn().mockReturnValue(testGoal),
    updateGoal: jest.fn().mockReturnValue(testGoal),
  }))
})

jest.mock('../../services/sentence-plan/planService', () => {
  return jest.fn().mockImplementation(() => ({
    agreePlan: jest.fn().mockResolvedValue(testPlan),
    getPlanByUuid: jest.fn().mockResolvedValue(testPlan),
  }))
})

describe('AchieveGoalController', () => {
  let controller: ReAddGoalController
  let req: Request
  let res: Response
  let next: NextFunction
  const viewData = {
    data: {
      dateOptions: [
        new Date('2024-04-01T00:00:00.000Z'),
        new Date('2024-07-01T00:00:00.000Z'),
        new Date('2025-01-01T00:00:00.000Z'),
      ],
      returnLink: '/some-return-link',
      goal: testGoal,
    },
    errors: {},
    locale: locale.en,
  }

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-01-01'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  beforeEach(() => {
    req = mockReq()
    res = mockRes()
    next = jest.fn()

    controller = new ReAddGoalController()
  })

  describe('get', () => {
    it('should render OK', async () => {
      await runMiddlewareChain(controller.get, req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/confirm-re-add-goal', viewData)
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

      expect(res.render).toHaveBeenCalledWith('pages/confirm-re-add-goal', expectedViewData)
    })
  })

  describe('post', () => {
    it('should mark goal as achieved with optional note details', async () => {
      req.params = {
        uuid: 'some-uuid',
      }
      req.body = {
        're-add-goal-reason': 'Re-added goal because...',
        'start-working-goal-radio': 'yes',
        'date-selection-radio': testGoal.targetDate,
      }

      req.method = 'POST'

      const expectedPartialNewGoal = {
        status: GoalStatus.ACTIVE,
        note: 'Re-added goal because...',
        targetDate: testGoal.targetDate,
      }

      await runMiddlewareChain(controller.post, req, res, next)

      expect(req.services.goalService.updateGoal).toHaveBeenCalledWith(expectedPartialNewGoal, req.params.uuid)
      // todo use utils function to work out redirect location from goal.type
      expect(res.redirect).toHaveBeenCalledWith(`/plan?type=${goalStatusToTabName(expectedPartialNewGoal.status)}`)
      expect(next).not.toHaveBeenCalled()
    })
  })
})
