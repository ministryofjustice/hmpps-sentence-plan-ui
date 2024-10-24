import { NextFunction, Request, Response } from 'express'
import RemoveGoalController from './RemoveGoalController'
import mockReq from '../../testutils/preMadeMocks/mockReq'
import mockRes from '../../testutils/preMadeMocks/mockRes'
import { testGoal } from '../../testutils/data/goalData'
import locale from './locale.json'
import URLs from '../URLs'
import testPlan, { agreedTestPlan } from '../../testutils/data/planData'

const mockGetPlanUUID = jest.fn().mockReturnValue(testPlan.uuid)
const mockSessionService = jest.fn().mockImplementation(() => ({
  getPlanUUID: mockGetPlanUUID,
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

describe('Test Deleting Goal', () => {
  let controller: RemoveGoalController
  let req: Request
  let res: Response
  let next: NextFunction
  const viewData = {
    data: {
      type: 'some-type',
      goal: testGoal,
      actionType: 'delete',
    },
    errors: {},
    locale: locale.en.delete,
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
      await controller.get(req, res, next)
      expect(res.render).toHaveBeenCalledWith('pages/remove-goal', viewData)
    })
  })

  describe('post', () => {
    it('should return to plan overview after deleting goal if delete goal is selected', async () => {
      req.body = { type: 'some-type', action: 'delete', goalUuid: 'xyz' }
      await controller.post(req as Request, res as Response, next)
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
      type: 'some-type',
      goal: testGoal,
      actionType: 'remove',
    },
    errors: {},
    locale: locale.en.remove,
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
      await controller.get(req, res, next)
      expect(res.render).toHaveBeenCalledWith('pages/remove-goal', viewData)
    })
  })

  describe('post', () => {
    it('should return to plan overview after removing goal if remove goal is selected', async () => {
      req.body = { type: 'some-type', action: 'remove', goalUuid: 'xyz', 'goal-removal-note': 'a reason' }
      await controller.post(req as Request, res as Response, next)
      expect(req.services.goalService.updateGoal).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith(`${URLs.PLAN_OVERVIEW}?type=some-type&status=removed`)
    })
  })
})
