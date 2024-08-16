import { NextFunction, Request, Response } from 'express'
import handoverData from '../../testutils/data/handoverData'
import RemoveGoalController from './RemoveGoalController'
import GoalService from '../../services/sentence-plan/goalService'
import mockReq from '../../testutils/preMadeMocks/mockReq'
import mockRes from '../../testutils/preMadeMocks/mockRes'
import { testGoal } from '../../testutils/data/goalData'
import locale from './locale.json'
import URLs from '../URLs'

jest.mock('../../services/sessionService', () => {
  return jest.fn().mockImplementation(() => ({
    getSubjectDetails: jest.fn().mockReturnValue(handoverData.subject),
  }))
})

jest.mock('../../services/sentence-plan/goalService', () => {
  return jest.fn().mockImplementation(() => ({
    removeGoal: jest.fn().mockReturnValue({ status: 204 }),
    getGoal: jest.fn().mockReturnValue(testGoal),
    updateGoal: jest.fn().mockReturnValue(testGoal),
  }))
})

describe('RemoveGoalController', () => {
  let controller: RemoveGoalController
  let mockGoalService: jest.Mocked<GoalService>
  let req: Request
  let res: Response
  let next: NextFunction
  const viewData = {
    data: {
      popData: handoverData.subject,
      type: 'some-type',
      goal: testGoal,
    },
    errors: {},
    locale: locale.en,
  }

  beforeEach(() => {
    mockGoalService = new GoalService(null) as jest.Mocked<GoalService>
    req = mockReq()
    res = mockRes()
    next = jest.fn()
    req.query.type = 'some-type'
    controller = new RemoveGoalController(mockGoalService)
  })

  describe('get', () => {
    it('should render without validation errors', async () => {
      await controller.get(req, res, next)
      expect(res.render).toHaveBeenCalledWith('pages/remove-goal', viewData)
    })
  })

  describe('post', () => {
    it('should return to plan-summary without removing goal if cancel removal', async () => {
      req = { body: { type: 'some-type', action: 'cancelRemove' } } as Request
      await controller.post(req as Request, res as Response, next)
      expect(mockGoalService.removeGoal).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith(`${URLs.PLAN_SUMMARY}?type=some-type`)
    })

    it('should return to plan-summary after removing goal if remove goal is selected', async () => {
      req = { body: { type: 'some-type', action: 'remove', goalUuid: 'xyz' } } as Request
      await controller.post(req as Request, res as Response, next)
      expect(mockGoalService.removeGoal).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith(`${URLs.PLAN_SUMMARY}?type=some-type&status=removed`)
    })
  })
})
