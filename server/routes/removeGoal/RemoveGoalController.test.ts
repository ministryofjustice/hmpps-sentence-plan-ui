import { NextFunction, Request, Response } from 'express'
import RemoveGoalController from './RemoveGoalController'
import mockReq from '../../testutils/preMadeMocks/mockReq'
import mockRes from '../../testutils/preMadeMocks/mockRes'
import { testGoal } from '../../testutils/data/goalData'
import locale from './locale.json'
import URLs from '../URLs'

jest.mock('../../services/sentence-plan/goalService', () => {
  return jest.fn().mockImplementation(() => ({
    removeGoal: jest.fn().mockReturnValue({ status: 204 }),
    getGoal: jest.fn().mockReturnValue(testGoal),
    updateGoal: jest.fn().mockReturnValue(testGoal),
  }))
})

describe('RemoveGoalController', () => {
  let controller: RemoveGoalController
  let req: Request
  let res: Response
  let next: NextFunction
  const viewData = {
    data: {
      type: 'some-type',
      goal: testGoal,
    },
    errors: {},
    locale: locale.en,
  }

  beforeEach(() => {
    req = mockReq()
    res = mockRes()
    next = jest.fn()
    req.query.type = 'some-type'
    controller = new RemoveGoalController()
  })

  describe('get', () => {
    it('should render without validation errors', async () => {
      await controller.get(req, res, next)
      expect(res.render).toHaveBeenCalledWith('pages/remove-goal', viewData)
    })
  })

  describe('post', () => {
    it('should return to plan-summary without removing goal if cancel removal', async () => {
      req.body = { type: 'some-type', action: 'cancelRemove' }
      await controller.post(req as Request, res as Response, next)
      expect(req.services.goalService.removeGoal).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith(`${URLs.PLAN_OVERVIEW}?type=some-type`)
    })

    it('should return to plan-summary after removing goal if remove goal is selected', async () => {
      req.body = { type: 'some-type', action: 'remove', goalUuid: 'xyz' }
      await controller.post(req as Request, res as Response, next)
      expect(req.services.goalService.removeGoal).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith(`${URLs.PLAN_OVERVIEW}?type=some-type&status=removed`)
    })
  })
})
