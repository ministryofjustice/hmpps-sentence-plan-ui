import { NextFunction, Request, Response } from 'express'
import testPlan from '../../testutils/data/planData'
import mockReq from '../../testutils/preMadeMocks/mockReq'
import mockRes from '../../testutils/preMadeMocks/mockRes'
import locale from './locale.json'
import testHandoverContext from '../../testutils/data/handoverData'
import AchieveGoalController from './AchieveGoalController'
import { testGoal } from '../../testutils/data/goalData'
import { GoalStatus } from '../../@types/GoalType'

jest.mock('../../services/sessionService', () => {
  return jest.fn().mockImplementation(() => ({
    getPlanUUID: jest.fn().mockReturnValue(testPlan.uuid),
    getPrincipalDetails: jest.fn().mockReturnValue(testHandoverContext.principal),
    getSubjectDetails: jest.fn().mockReturnValue(testHandoverContext.subject),
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
  let controller: AchieveGoalController
  let req: Request
  let res: Response
  let next: NextFunction
  const viewData = {
    data: {
      goal: testGoal,
    },
    errors: {},
    locale: locale.en,
  }

  beforeEach(() => {
    req = mockReq()
    res = mockRes()
    next = jest.fn()

    controller = new AchieveGoalController()
  })

  describe('get', () => {
    it('should render OK', async () => {
      await controller.get(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/confirm-achieved-goal', viewData)
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

      const expectedPartialNewGoal = {
        status: GoalStatus.ACHIEVED,
        note: 'Note body',
      }

      await controller.post(req, res, next)

      expect(req.services.goalService.updateGoal).toHaveBeenCalledWith(expectedPartialNewGoal, 'some-uuid')
      expect(res.redirect).toHaveBeenCalledWith('/plan?type=achieved&status=achieved')
      expect(next).not.toHaveBeenCalled()
    })
  })
})
