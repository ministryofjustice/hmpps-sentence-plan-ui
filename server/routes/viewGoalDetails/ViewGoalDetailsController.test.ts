import { NextFunction, Request, Response } from 'express'
import ViewGoalDetailsController from './ViewGoalDetailsController'
import mockReq from '../../testutils/preMadeMocks/mockReq'
import mockRes from '../../testutils/preMadeMocks/mockRes'
import locale from './locale.json'
import { testGoal } from '../../testutils/data/goalData'
import URLs from '../URLs'
import { Goal, GoalStatus } from '../../@types/GoalType'

jest.mock('../../services/sessionService', () => {
  return jest.fn().mockImplementation(() => ({
    getReturnLink: jest.fn(),
  }))
})

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

    controller = new ViewGoalDetailsController()
  })

  describe('get', () => {
    test.each([[GoalStatus.ACHIEVED], [GoalStatus.REMOVED]])(
      'should render without validation errors for %s',
      async status => {
        const goal: Goal = { ...testGoal, status }
        req.services.goalService.getGoal = jest.fn().mockResolvedValue(goal)

        const viewDataPermittedStatus = {
          ...viewData,
          data: {
            goal,
            returnLink: URLs.PLAN_OVERVIEW,
          },
        }

        await controller.get(req, res, next)

        expect(res.render).toHaveBeenCalledWith('pages/view-goal-details', viewDataPermittedStatus)
      },
    )

    it('should not render when Goal is not Achieved or Removed', async () => {
      await controller.get(req, res, next)

      expect(res.render).not.toHaveBeenCalledWith('pages/view-goal-details', viewData)
    })
  })
})
