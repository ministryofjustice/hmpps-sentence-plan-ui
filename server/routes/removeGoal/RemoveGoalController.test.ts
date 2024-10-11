import { NextFunction, Request, Response } from 'express'
import RemoveGoalController from './RemoveGoalController'
import mockReq from '../../testutils/preMadeMocks/mockReq'
import mockRes from '../../testutils/preMadeMocks/mockRes'
import { testGoal } from '../../testutils/data/goalData'
import locale from './locale.json'
import URLs from '../URLs'

jest.mock('../../services/sentence-plan/goalService', () => {
  return jest.fn().mockImplementation(() => ({
    deleteGoal: jest.fn().mockReturnValue({ status: 204 }),
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
    it('should return to plan-summary after deleting goal if delete goal is selected', async () => {
      req.body = { type: 'some-type', action: 'delete', goalUuid: 'xyz' }
      await controller.post(req as Request, res as Response, next)
      expect(req.services.goalService.deleteGoal).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith(`${URLs.PLAN_SUMMARY}?type=some-type&status=removed`)
    })
  })
})
