import { NextFunction, Request, Response } from 'express'
import PlanOverviewController from './PlanOverviewController'
import mockReq from '../../testutils/preMadeMocks/mockReq'
import mockRes from '../../testutils/preMadeMocks/mockRes'
import locale from './locale.json'
import testPlan from '../../testutils/data/planData'
import runMiddlewareChain from '../../testutils/runMiddlewareChain'
import testHandoverContext from '../../testutils/data/handoverData'
import { AccessMode } from '../../@types/Handover'

const oasysReturnUrl = 'https://oasys.return.url'

jest.mock('../../services/sessionService', () => {
  return jest.fn().mockImplementation(() => ({
    getPlanUUID: jest.fn().mockReturnValue(testPlan.uuid),
    getOasysReturnUrl: jest.fn().mockReturnValue(oasysReturnUrl),
    getPrincipalDetails: jest.fn().mockReturnValue(testHandoverContext.principal),
    setReturnLink: jest.fn().mockImplementation,
    getPlanVersionNumber: jest.fn().mockReturnValue(null),
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
  let viewData: any

  beforeEach(() => {
    viewData = {
      locale: locale.en,
      data: {
        plan: testPlan,
        type: 'current',
        oasysReturnUrl,
      },
      errors: {
        body: {},
        params: {},
        query: {},
      },
    }

    req = mockReq()
    res = mockRes()
    next = jest.fn()

    controller = new PlanOverviewController()
  })

  describe('get', () => {
    it('should render without validation errors', async () => {
      await runMiddlewareChain(controller.get, req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/plan', viewData)
    })

    it('should render without validation errors when user is READ_ONLY', async () => {
      req.services.sessionService.getPrincipalDetails = jest.fn().mockReturnValue({
        ...testHandoverContext.principal,
        accessMode: AccessMode.READ_ONLY,
      })
      await runMiddlewareChain(controller.get, req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/countersign', viewData)
    })

    it('should permit valid type and status parameters', async () => {
      viewData.data = {
        ...viewData.data,
        type: 'future',
        status: 'removed',
      }

      req = mockReq({
        query: {
          type: 'future',
          status: 'removed',
        },
      })

      await runMiddlewareChain(controller.get, req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/plan', viewData)
    })

    it('should remove invalid type and status parameters', async () => {
      viewData.errors.query = {
        status: {
          isEnum: true,
        },
        type: {
          isEnum: true,
        },
      }

      req = mockReq({
        query: {
          type: 'cheese',
          status: 'sausage',
        },
      })

      await runMiddlewareChain(controller.get, req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/plan', viewData)
    })
  })
})
