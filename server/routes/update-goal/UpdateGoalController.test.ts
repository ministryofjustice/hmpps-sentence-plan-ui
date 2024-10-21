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

jest.mock('../../services/sentence-plan/referentialDataService', () => {
  return jest.fn().mockImplementation(() => ({
    getSortedAreasOfNeed: jest.fn().mockReturnValue(AreaOfNeed),
  }))
})

jest.mock('../../services/sentence-plan/goalService', () => {
  return jest.fn().mockImplementation(() => ({
    getGoal: jest.fn().mockResolvedValue(testGoal),
  }))
})

jest.mock('../../services/sessionService', () => {
  return jest.fn().mockImplementation(() => ({
    getSubjectDetails: jest.fn().mockReturnValue(handoverData.subject),
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
      goal: testGoal,
      popData: handoverData.subject,
      mainAreaOfNeed: AreaOfNeed.find(x => x.name === testGoal.areaOfNeed.name),
      relatedAreasOfNeed: testGoal.relatedAreasOfNeed.map(x => x.name),
    },
    errors: {},
  }

  beforeEach(() => {
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
      await controller.get(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/update-goal', viewData)
    })
  })

  describe('post', () => {
    it('should submit the updated fields and redirect to the summary page', async () => {
      req.body = {
        'step-status-1': StepStatus.IN_PROGRESS,
        'step-uuid-1': testStep.uuid,
      }

      await runMiddlewareChain(controller.post, req, res, next)

      expect(req.services.stepService.saveAllSteps).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith(`${URLs.PLAN_OVERVIEW}`)
      expect(res.render).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    it('should call next with an error if saveAllSteps fails', async () => {
      req.body = {
        'step-status-1': StepStatus.IN_PROGRESS,
        'step-uuid-1': testStep.uuid,
      }

      const saveError = new Error('Save failed')
      req.services.stepService.saveAllSteps = jest.fn().mockRejectedValue(saveError)

      await runMiddlewareChain(controller.post, req, res, next)

      expect(next).toHaveBeenCalledWith(saveError)
      expect(res.render).not.toHaveBeenCalled()
    })

    it('should have redirected to the error page when incorrect uuid submitted', async () => {
      req.body = {
        'step-status-1': 'IN_PROGRESS',
        'step-uuid-1': 'thisuuid-wasnt-what-waas-expected0000',
      }

      await runMiddlewareChain(controller.post, req, res, next)

      expect(next).toHaveBeenCalledWith(new Error('different steps were submitted'))
    })

    it('should redirect to the same page when a validation errors occur', async () => {
      req.body = {
        'step-status-1': 'NOT_A_REAL_STATUS',
        'step-uuid-1': testStep.uuid,
      }

      await runMiddlewareChain(controller.post, req, res, next)

      expect(res.render).toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })
  })
})