import { NextFunction, Request, Response } from 'express'
import mockReq from '../../testutils/preMadeMocks/mockReq'
import mockRes from '../../testutils/preMadeMocks/mockRes'
import locale from './locale.json'
import PreviousVersionsController from './PreviousVersionsController'
import testPlan from '../../testutils/data/planData'
import { AuditEvent } from '../../services/auditService'
import { testPreviousVersionsResponse, testPreviousVersionsResult } from '../../testutils/data/previousVersions'
import { HttpError } from '../../utils/HttpError'

const oasysReturnUrl = 'https://oasys.return.url'
const returnLink = 'https://return.url'

jest.mock('../../services/auditService')

jest.mock('../../services/sessionService', () => {
  return jest.fn().mockImplementation(() => ({
    getPlanUUID: jest.fn().mockReturnValue(testPlan.uuid),
    getSystemReturnUrl: jest.fn().mockReturnValue(oasysReturnUrl),
    getReturnLink: jest.fn().mockReturnValue(returnLink),
  }))
})

jest.mock('../../services/sentence-plan/planService', () => {
  return jest.fn().mockImplementation(() => ({
    getPlanByUuid: jest.fn().mockResolvedValue(testPlan),
  }))
})

jest.mock('../../services/sentence-plan/coordinatorService', () => {
  return jest.fn().mockImplementation(() => ({
    getVersionsByUuid: jest.fn().mockResolvedValue(testPreviousVersionsResponse),
  }))
})

describe('PreviousVersionsController', () => {
  let controller: PreviousVersionsController

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
        pageId: 'previous-versions',
        oasysReturnUrl,
        versions: testPreviousVersionsResult,
        returnLink,
      },
      errors: {},
    }

    req = mockReq()
    res = mockRes()
    next = jest.fn()

    controller = new PreviousVersionsController()
  })

  describe('get', () => {
    it('should render without errors, log audit event and trim the latest (current) version', async () => {
      await controller.get(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/previous-versions', viewData)
      expect(req.services.auditService.send).toHaveBeenCalledWith(AuditEvent.VIEW_PREVIOUS_VERSIONS_PAGE)
    })

    it('should call next with HttpError(500) if service throws', async () => {
      ;(req.services.planService.getPlanByUuid as jest.Mock).mockRejectedValue(new Error('Service not found'))

      await controller.get(req, res, next)
      expect(next).toHaveBeenCalledWith(HttpError(500, 'Service not found'))
    })
  })
})
