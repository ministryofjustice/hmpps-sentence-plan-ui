import { NextFunction, Request, Response } from 'express'
import RemoveGoalController from './RemoveGoalController'
import mockReq from '../../testutils/preMadeMocks/mockReq'
import mockRes from '../../testutils/preMadeMocks/mockRes'
import { testGoal } from '../../testutils/data/goalData'
import localeDelete from './locale-delete.json'
import localeRemove from './locale-remove.json'
import URLs from '../URLs'
import testPlan, { agreedTestPlan } from '../../testutils/data/planData'
import runMiddlewareChain from '../../testutils/runMiddlewareChain'

const mockGetPlanUUID = jest.fn().mockReturnValue(testPlan.uuid)
const mockSessionService = jest.fn().mockImplementation(() => ({
  getPlanUUID: mockGetPlanUUID,
  getReturnLink: jest.fn().mockReturnValue(''),
}))

jest.mock('../../middleware/authorisationMiddleware', () => ({
  requireAccessMode: jest.fn(() => (req: Request, res: Response, next: NextFunction) => {
    return next()
  }),
}))

jest.mock('../../services/sessionService', () => {
  return jest.fn().mockImplementation(() => mockSessionService())
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

jest.mock('../../services/sentence-plan/goalService', () => {
  return jest.fn().mockImplementation(() => ({
    deleteGoal: jest.fn().mockReturnValue({ status: 204 }),
    removeGoal: jest.fn().mockReturnValue(testGoal),
    getGoal: jest.fn().mockReturnValue(testGoal),
    updateGoal: jest.fn().mockReturnValue(testGoal),
  }))
})

describe('Remove Goal', () => {
  let controller: RemoveGoalController
  let req: Request
  let res: Response
  let next: NextFunction
  const viewData = {
    data: {
      form: {},
      returnLink: '',
      type: 'current',
      goal: testGoal,
      actionType: 'delete',
    },
    errors: {},
    locale: localeDelete.en,
  }

  beforeEach(() => {
    req = mockReq()
    res = mockRes()
    next = jest.fn()
    req.query.type = 'some-type'
    req.url = '/confirm-delete-goal'
    controller = new RemoveGoalController()
  })

  describe('get', () => {
    it('should render without validation errors', async () => {
      await runMiddlewareChain(controller.get, req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/remove-goal', viewData)
    })
  })

  describe('post', () => {
    it('should return to plan overview after deleting goal if delete goal is selected', async () => {
      req.body = { type: 'some-type', action: 'delete', goalUuid: 'xyz' }

      await runMiddlewareChain(controller.post, req, res, next)

      expect(req.services.goalService.deleteGoal).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith(`${URLs.PLAN_OVERVIEW}?type=some-type&status=deleted`)
    })
  })
})

describe('Test Removing Goal', () => {
  let controller: RemoveGoalController
  let req: Request
  let res: Response
  let next: NextFunction
  const viewData = {
    data: {
      form: {},
      returnLink: '',
      type: 'current',
      goal: testGoal,
      actionType: 'remove',
    },
    errors: {},
    locale: localeRemove.en,
  }

  beforeEach(() => {
    req = mockReq()
    res = mockRes()
    next = jest.fn()
    req.query.type = 'some-type'
    req.url = '/remove-goal'
    controller = new RemoveGoalController()
  })

  describe('get', () => {
    mockSessionService().getPlanUUID.mockReset()

    it('should render without validation errors', async () => {
      mockGetPlanUUID.mockImplementation(() => 'agreed-plan-uuid')

      await runMiddlewareChain(controller.get, req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/remove-goal', viewData)
    })
  })

  describe('post', () => {
    it('should return to plan overview after removing goal if remove goal is selected and a reason provided', async () => {
      req.body = { type: 'some-type', action: 'remove', goalUuid: 'xyz', 'goal-removal-note': 'a reason' }

      await runMiddlewareChain(controller.post, req, res, next)

      expect(req.services.goalService.updateGoal).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith(`${URLs.PLAN_OVERVIEW}?type=removed&status=removed`)
    })

    it('should re-render remove goal page if remove goal is selected and no reason is provided', async () => {
      req.body = { type: 'some-type', action: 'remove', goalUuid: 'xyz' }

      await runMiddlewareChain(controller.post, req, res, next)

      expect(req.services.goalService.updateGoal).not.toHaveBeenCalled()
      expect(res.render).toHaveBeenCalled()
    })
  })
})
