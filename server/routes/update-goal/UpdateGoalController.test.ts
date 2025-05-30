import { NextFunction, Request, Response } from 'express'
import UpdateGoalController from './UpdateGoalController'
import mockReq from '../../testutils/preMadeMocks/mockReq'
import mockRes from '../../testutils/preMadeMocks/mockRes'
import { AreaOfNeed } from '../../testutils/data/referenceData'
import ReferentialDataService from '../../services/sentence-plan/referentialDataService'
import locale from './locale.json'
import handoverData from '../../testutils/data/handoverData'
import { testGoal } from '../../testutils/data/goalData'
import runMiddlewareChain from '../../testutils/runMiddlewareChain'
import URLs from '../URLs'
import { testStep } from '../../testutils/data/stepData'
import { StepStatus } from '../../@types/StepType'
import { AuditEvent } from '../../services/auditService'

jest.mock('../../services/auditService')

jest.mock('../../middleware/authorisationMiddleware', () => ({
  requireAccessMode: jest.fn(() => (req: Request, res: Response, next: NextFunction) => {
    return next()
  }),
}))

jest.mock('../../services/sentence-plan/referentialDataService', () => {
  return jest.fn().mockImplementation(() => ({
    getSortedAreasOfNeed: jest.fn().mockReturnValue(AreaOfNeed),
  }))
})

jest.mock('../../services/sentence-plan/goalService', () => {
  return jest.fn().mockImplementation(() => ({
    getGoal: jest.fn().mockResolvedValue(testGoal),
    updateGoalStatus: jest.fn().mockResolvedValue(testGoal),
  }))
})

jest.mock('../../services/sessionService', () => {
  return jest.fn().mockImplementation(() => ({
    getSubjectDetails: jest.fn().mockReturnValue(handoverData.subject),
    setReturnLink: jest.fn(),
    getReturnLink: jest.fn().mockReturnValue('/some-return-link'),
  }))
})

jest.mock('../../services/sentence-plan/stepsService', () => {
  return jest.fn().mockImplementation(() => ({
    saveAllSteps: jest.fn().mockResolvedValue(testGoal),
  }))
})

describe('UpdateGoalController', () => {
  let controller: UpdateGoalController
  let mockReferentialDataService: jest.Mocked<ReferentialDataService>

  let req: Request
  let res: Response
  let next: NextFunction

  const viewData = {
    locale: locale.en,
    data: {
      form: {},
      goal: testGoal,
      popData: handoverData.subject,
      mainAreaOfNeed: AreaOfNeed.find(x => x.name === testGoal.areaOfNeed.name),
      relatedAreasOfNeed: testGoal.relatedAreasOfNeed.map(x => x.name),
      returnLink: '/plan?type=current',
    },
    errors: {},
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockReferentialDataService = new ReferentialDataService() as jest.Mocked<ReferentialDataService>
    req = mockReq({
      params: { uuid: testGoal.uuid },
    })
    res = mockRes()
    next = jest.fn()

    controller = new UpdateGoalController(mockReferentialDataService)
  })

  describe('get', () => {
    it('should render without validation errors', async () => {
      await runMiddlewareChain(controller.get, req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/update-goal', viewData)
      expect(req.services.auditService.send).toHaveBeenCalledTimes(1)
      expect(req.services.auditService.send).toHaveBeenCalledWith(AuditEvent.VIEW_UPDATE_GOAL_AND_STEPS_PAGE, {
        goalUUID: testGoal.uuid,
      })
    })
  })

  describe('post', () => {
    it('should submit the updated fields and redirect to the summary page', async () => {
      req.body = {
        'step-status-1': StepStatus.IN_PROGRESS,
        'step-uuid-1': testStep.uuid,
        'more-detail': '',
      }

      await runMiddlewareChain(controller.post, req, res, next)

      expect(req.services.stepService.saveAllSteps).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith(`${URLs.PLAN_OVERVIEW}?type=current`)
      expect(res.render).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
      expect(req.services.auditService.send).toHaveBeenCalledTimes(1)
      expect(req.services.auditService.send).toHaveBeenCalledWith(AuditEvent.UPDATE_GOAL_AND_STEPS, {
        goalUUID: testGoal.uuid,
      })
    })

    it('should submit the updated fields and redirect to the mark as achieved page if mark as achieved clicked', async () => {
      req.body = {
        'step-status-1': StepStatus.IN_PROGRESS,
        'step-uuid-1': testStep.uuid,
        'more-detail': '',
        action: 'mark-as-achieved',
      }

      await runMiddlewareChain(controller.post, req, res, next)

      expect(req.services.stepService.saveAllSteps).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/confirm-achieved-goal/a-un1qu3-t3st-Uu1d')
      expect(res.render).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
      expect(req.services.auditService.send).toHaveBeenCalledTimes(1)
      expect(req.services.auditService.send).toHaveBeenCalledWith(AuditEvent.UPDATE_GOAL_AND_STEPS, {
        goalUUID: testGoal.uuid,
      })
    })

    it('should submit the updated fields and redirect to the remove goal page if remove goal from plan clicked', async () => {
      req.body = {
        'step-status-1': StepStatus.IN_PROGRESS,
        'step-uuid-1': testStep.uuid,
        'more-detail': 'A note',
        action: 'remove',
      }

      await runMiddlewareChain(controller.post, req, res, next)

      expect(req.services.stepService.saveAllSteps).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/remove-goal/a-un1qu3-t3st-Uu1d')
      expect(res.render).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
      expect(req.services.auditService.send).toHaveBeenCalledTimes(1)
      expect(req.services.auditService.send).toHaveBeenCalledWith(AuditEvent.UPDATE_GOAL_AND_STEPS, {
        goalUUID: testGoal.uuid,
      })
    })

    it('should call next with an error if saveAllSteps fails', async () => {
      req.body = {
        'step-status-1': StepStatus.IN_PROGRESS,
        'step-uuid-1': testStep.uuid,
        'more-detail': '',
      }

      const saveError = new Error('Save failed')
      req.services.stepService.saveAllSteps = jest.fn().mockRejectedValue(saveError)

      await runMiddlewareChain(controller.post, req, res, next)

      expect(next).toHaveBeenCalledWith(saveError)
      expect(res.render).not.toHaveBeenCalled()
      expect(req.services.auditService.send).not.toHaveBeenCalled()
    })

    it('should redirect to the error page when incorrect uuid submitted', async () => {
      req.body = {
        'step-status-1': 'IN_PROGRESS',
        'step-uuid-1': 'thisuuid-wasnt-what-waas-expected0000',
        'more-detail': '',
      }

      await runMiddlewareChain(controller.post, req, res, next)

      expect(next).toHaveBeenCalledWith(new Error('different steps were submitted'))
      expect(req.services.auditService.send).not.toHaveBeenCalled()
    })

    it('should redirect to the plan page when saved with no steps and no note', async () => {
      testGoal.steps = []
      req.body['more-detail'] = ''

      await runMiddlewareChain(controller.post, req, res, next)

      expect(res.redirect).toHaveBeenCalledWith(`${URLs.PLAN_OVERVIEW}?type=current`)
      expect(req.services.stepService.saveAllSteps).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
      expect(req.services.auditService.send).toHaveBeenCalledTimes(1)
      expect(req.services.auditService.send).toHaveBeenCalledWith(AuditEvent.UPDATE_GOAL_AND_STEPS, {
        goalUUID: testGoal.uuid,
      })
    })

    it('should redirect to the achieve goal page when saved when all steps are completed', async () => {
      req.body = {
        'step-status-1': StepStatus.COMPLETED,
        'step-uuid-1': testStep.uuid,
        'more-detail': '',
      }

      await runMiddlewareChain(controller.post, req, res, next)

      expect(res.redirect).toHaveBeenCalledWith(`${URLs.CONFIRM_ACHIEVE_GOAL.replace(':uuid', testGoal.uuid)}`)
      expect(next).not.toHaveBeenCalled()
      expect(req.services.auditService.send).toHaveBeenCalledTimes(1)
      expect(req.services.auditService.send).toHaveBeenCalledWith(AuditEvent.UPDATE_GOAL_AND_STEPS, {
        goalUUID: testGoal.uuid,
      })
    })

    it('should redirect to the same page when a validation error occurs', async () => {
      req.body = {
        'step-status-1': 'NOT_A_REAL_STATUS',
        'step-uuid-1': testStep.uuid,
      }

      await runMiddlewareChain(controller.post, req, res, next)

      expect(res.render).toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
      expect(req.services.auditService.send).toHaveBeenCalledTimes(1)
      expect(req.services.auditService.send).toHaveBeenCalledWith(AuditEvent.VIEW_UPDATE_GOAL_AND_STEPS_PAGE, {
        goalUUID: testGoal.uuid,
      })
    })
  })
})
