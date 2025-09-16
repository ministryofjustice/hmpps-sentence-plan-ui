import { NextFunction, Request, Response } from 'express'
import PlanOverviewController from './PlanOverviewController'
import mockReq from '../../testutils/preMadeMocks/mockReq'
import mockRes from '../../testutils/preMadeMocks/mockRes'
import locale from './locale.json'
import testPlan from '../../testutils/data/planData'
import runMiddlewareChain from '../../testutils/runMiddlewareChain'
import testHandoverContext from '../../testutils/data/handoverData'
import { PlanAgreementStatus, PlanType } from '../../@types/PlanType'
import { AuditEvent } from '../../services/auditService'
import { AccessMode } from '../../@types/SessionType'

const systemReturnUrl = 'https://oasys.return.url'

jest.mock('../../services/auditService')

jest.mock('../../middleware/authorisationMiddleware', () => ({
  requireAccessMode: jest.fn(() => (req: Request, res: Response, next: NextFunction) => {
    return next()
  }),
}))

jest.mock('../../services/sessionService', () => {
  return jest.fn().mockImplementation(() => ({
    getPlanUUID: jest.fn().mockReturnValue(testPlan.uuid),
    getSystemReturnUrl: jest.fn().mockReturnValue(systemReturnUrl),
    getPrincipalDetails: jest.fn().mockReturnValue(testHandoverContext.principal),
    getAccessMode: jest.fn().mockReturnValue(AccessMode.READ_WRITE),
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
    jest.clearAllMocks()

    viewData = {
      locale: locale.en,
      data: {
        planAgreementStatus: testPlan.agreementStatus,
        plan: testPlan,
        isUpdatedAfterAgreement: false,
        type: 'current',
        systemReturnUrl,
        readWrite: true,
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
    afterEach(() => {
      expect(req.services.auditService.send).toHaveBeenCalledWith(AuditEvent.VIEW_PLAN_OVERVIEW_PAGE)
    })

    it('should render without validation errors', async () => {
      await runMiddlewareChain(controller.get, req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/plan', viewData)
    })

    it('should render without validation errors when user is READ_ONLY', async () => {
      ;(req.services.sessionService.getAccessMode as jest.Mock).mockReturnValue(AccessMode.READ_ONLY)
      await runMiddlewareChain(controller.get, req, res, next)

      const viewDataReadOnly = { ...viewData }
      viewDataReadOnly.data.readWrite = false

      expect(res.render).toHaveBeenCalledWith('pages/plan', viewDataReadOnly)
    })

    it('should have validation error if viewing Agreed Plan when Goal has no Steps', async () => {
      const badPlanData: PlanType = {
        ...testPlan,
        agreementStatus: PlanAgreementStatus.AGREED,
        goals: [
          {
            ...testPlan.goals[0],
            steps: [],
          },
        ],
      }

      req.method = 'GET'
      req.services.planService.getPlanByUuid = jest.fn().mockResolvedValue(badPlanData)
      await runMiddlewareChain(controller.get, req, res, next)

      const viewDataWithValidationError = {
        ...viewData,
        data: {
          ...viewData.data,
          plan: badPlanData,
          planAgreementStatus: badPlanData.agreementStatus,
        },
        errors: {
          ...viewData.errors,
          domain: { 'goals.0.steps': { arrayNotEmpty: true } },
        },
      }

      expect(res.render).toHaveBeenCalledWith('pages/plan', viewDataWithValidationError)
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
