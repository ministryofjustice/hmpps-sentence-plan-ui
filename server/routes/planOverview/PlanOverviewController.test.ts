import { NextFunction, Request, Response } from 'express'
import PlanOverviewController from './PlanOverviewController'
import mockReq from '../../testutils/preMadeMocks/mockReq'
import mockRes from '../../testutils/preMadeMocks/mockRes'
import locale from './locale.json'
import { testGoal } from '../../testutils/data/goalData'
import testPlan from '../../testutils/data/planData'

const oasysReturnUrl = 'https://oasys.return.url'

jest.mock('../../services/sessionService', () => {
  return jest.fn().mockImplementation(() => ({
    getPlanUUID: jest.fn().mockReturnValue(testPlan.uuid),
    getOasysReturnUrl: jest.fn().mockReturnValue(oasysReturnUrl),
    setReturnLink: jest.fn().mockImplementation,
  }))
})

jest.mock('../../services/sentence-plan/planService', () => {
  return jest.fn().mockImplementation(() => ({
    getPlanByUuid: jest.fn().mockReturnValue(testPlan),
  }))
})

describe('PlanOverviewController', () => {
  let controller: PlanOverviewController

  let req: Request
  let res: Response
  let next: NextFunction

  const viewData = {
    locale: locale.en,
    data: {
      plan: testPlan,
      type: 'current',
      oasysReturnUrl,
    },
    errors: {},
  }

  beforeEach(() => {
    req = mockReq({
      params: { uuid: testGoal.uuid },
    })
    res = mockRes()
    next = jest.fn()

    controller = new PlanOverviewController()
  })

  describe('get', () => {
    it('should render without validation errors', async () => {
      await controller.get(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/plan', viewData)
    })
  })
})
