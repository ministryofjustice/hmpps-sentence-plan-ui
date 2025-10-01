import { NextFunction, Request, Response } from 'express'
import ViewPreviousVersionController from './ViewPreviousVersionController'
import mockReq from '../../testutils/preMadeMocks/mockReq'
import mockRes from '../../testutils/preMadeMocks/mockRes'
import planOverviewLocale from '../planOverview/locale.json'
import locale from './locale.json'
import testPlan from '../../testutils/data/planData'
import runMiddlewareChain from '../../testutils/runMiddlewareChain'
import { AuditEvent } from '../../services/auditService'
import { AccessMode } from '../../@types/SessionType'
import { HttpError } from '../../utils/HttpError'

jest.mock('../../services/auditService')

jest.mock('../../middleware/authorisationMiddleware', () => ({
  requireAccessMode: jest.fn(() => (req: Request, res: Response, next: NextFunction) => next()),
}))

jest.mock('../../services/sessionService', () => {
  return jest.fn().mockImplementation(() => ({
    getAccessMode: jest.fn().mockReturnValue(AccessMode.READ_WRITE),
  }))
})

jest.mock('../../services/sentence-plan/planService', () => {
  return jest.fn().mockImplementation(() => ({
    getPlanVersionByVersionUuid: jest.fn().mockResolvedValue(testPlan),
  }))
})

describe('ViewPreviousVersionController', () => {
  let controller: ViewPreviousVersionController

  let req: Request
  let res: Response
  let next: NextFunction
  let viewData: any

  beforeEach(() => {
    jest.clearAllMocks()

    viewData = {
      locale: { ...planOverviewLocale.en, ...locale.en },
      data: {
        planAgreementStatus: testPlan.agreementStatus,
        plan: testPlan,
        isUpdatedAfterAgreement: false,
        type: 'current',
        readWrite: true,
        viewPreviousVersionMode: true,
        planVersionBaseUrl: `/view-historic/${testPlan.uuid}`,
      },
      errors: {
        body: {},
        params: {},
        query: {},
      },
    }

    req = mockReq({
      params: { planVersionUuid: testPlan.uuid },
    })
    res = mockRes()
    next = jest.fn()
    controller = new ViewPreviousVersionController()
  })

  describe('get', () => {
    it('should render the previous version page without errors', async () => {
      await runMiddlewareChain(controller.get, req, res, next)
      expect(res.render).toHaveBeenCalledWith('pages/plan', viewData)
      expect(req.services.auditService.send).toHaveBeenCalledWith(AuditEvent.VIEW_PREVIOUS_VERSION)
    })

    it('should set readWrite to false if session is READ_ONLY', async () => {
      ;(req.services.sessionService.getAccessMode as jest.Mock).mockReturnValue(AccessMode.READ_ONLY)
      await runMiddlewareChain(controller.get, req, res, next)

      const expected = { ...viewData }
      expected.data.readWrite = false
      expect(res.render).toHaveBeenCalledWith('pages/plan', expected)
      expect(req.services.auditService.send).toHaveBeenCalledWith(AuditEvent.VIEW_PREVIOUS_VERSION)
    })

    it('should handle validation errors for DRAFT plans', async () => {
      req.services.planService.getPlanVersionByVersionUuid = jest.fn().mockResolvedValue(testPlan)
      req.errors = { domain: { someError: true } }

      await runMiddlewareChain(controller.get, req, res, next)

      const expected = {
        ...viewData,
        data: {
          ...viewData.data,
          plan: testPlan,
          planAgreementStatus: testPlan.agreementStatus,
        },
        errors: req.errors,
      }

      expect(res.render).toHaveBeenCalledWith('pages/plan', expected)
    })

    it('should call next with HttpError if planService throws', async () => {
      req.services.planService.getPlanVersionByVersionUuid = jest.fn().mockRejectedValue(new Error('Service not found'))

      await runMiddlewareChain(controller.get, req, res, next)
      expect(next).toHaveBeenCalledWith(HttpError(500, 'Service not found'))
    })
  })
})
