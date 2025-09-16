import { NextFunction, Request, Response } from 'express'
import mockReq from '../../testutils/preMadeMocks/mockReq'
import mockRes from '../../testutils/preMadeMocks/mockRes'
import locale from './locale.json'
import testPlan from '../../testutils/data/planData'
import testNoteData from '../../testutils/data/noteData'
import PlanHistoryController from './PlanHistoryController'
import { AuditEvent } from '../../services/auditService'
import { AccessMode } from '../../@types/SessionType'

const systemReturnUrl = 'https://oasys.return.url'

jest.mock('../../services/auditService')

jest.mock('../../services/sessionService', () => {
  return jest.fn().mockImplementation(() => ({
    getPlanUUID: jest.fn().mockReturnValue(testPlan.uuid),
    getPlanVersionNumber: jest.fn().mockReturnValue(null),
    getSystemReturnUrl: jest.fn().mockReturnValue(systemReturnUrl),
    getAccessMode: jest.fn().mockReturnValue(AccessMode.READ_WRITE),
    setReturnLink: jest.fn(),
  }))
})

jest.mock('../../services/sentence-plan/planService', () => {
  return jest.fn().mockImplementation(() => ({
    getNotes: jest.fn().mockReturnValue([testNoteData]),
    getPlanByUuid: jest.fn().mockResolvedValue(testPlan),
  }))
})

describe('PlanHistoryController with READ_WRITE permissions', () => {
  let controller: PlanHistoryController

  let req: Request
  let res: Response
  let next: NextFunction
  let viewData: any

  beforeEach(() => {
    jest.clearAllMocks()

    viewData = {
      locale: locale.en,
      data: {
        notes: [testNoteData],
        plan: testPlan,
        systemReturnUrl,
        pageId: 'plan-history',
        readWrite: true,
      },
      errors: {},
    }

    req = mockReq()
    res = mockRes()
    next = jest.fn()

    controller = new PlanHistoryController()
  })

  describe('get', () => {
    it('should render without validation errors and a plan agreement note', async () => {
      await controller.get(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/plan-history', viewData)
      expect(req.services.auditService.send).toHaveBeenCalledWith(AuditEvent.VIEW_PLAN_HISTORY_PAGE)
    })
    it('should return 403 when no notes exist', async () => {
      req.services.planService.getNotes = jest.fn().mockReturnValue([]) // Set the notes to be empty

      const nextMock = jest.fn()

      await controller.get(req, res, nextMock)

      // Check that the next function was called with the expected HttpError
      expect(nextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 403,
          message: 'Plan has not been agreed',
        }),
      )
      expect(req.services.auditService.send).not.toHaveBeenCalled()
    })
  })
})

describe('PlanHistoryController with READ_ONLY permissions', () => {
  let controller: PlanHistoryController

  let req: Request
  let res: Response
  let next: NextFunction
  let viewData: any

  beforeEach(() => {
    jest.clearAllMocks()

    viewData = {
      locale: locale.en,
      data: {
        notes: [testNoteData],
        plan: testPlan,
        systemReturnUrl,
        pageId: 'plan-history',
        readWrite: false,
      },
      errors: {},
    }

    req = mockReq()
    res = mockRes()
    next = jest.fn()

    req.services.sessionService.getAccessMode = jest.fn().mockReturnValue(AccessMode.READ_ONLY)

    controller = new PlanHistoryController()
  })

  describe('get', () => {
    it('should render without validation errors and no notes', async () => {
      await controller.get(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/plan-history', viewData)
      expect(req.services.auditService.send).toHaveBeenCalledWith(AuditEvent.VIEW_PLAN_HISTORY_PAGE)
    })

    // render without errors and plan agreement note
    it('should render without validation errors and a a plan agreement note', async () => {
      // change the mock functionality to return a test note
      req.services.planService.getNotes = jest.fn().mockReturnValue([testNoteData])

      await controller.get(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/plan-history', viewData)
      expect(req.services.auditService.send).toHaveBeenCalledWith(AuditEvent.VIEW_PLAN_HISTORY_PAGE)
    })
  })
})
