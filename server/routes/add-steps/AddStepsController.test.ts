import { NextFunction, Request, Response } from 'express'
import AddStepsController from './AddStepsController'
import mockReq from '../../testutils/preMadeMocks/mockReq'
import mockRes from '../../testutils/preMadeMocks/mockRes'
import locale from './locale.json'
import { testGoal } from '../../testutils/data/goalData'
import handoverData from '../../testutils/data/handoverData'
import { testStep } from '../../testutils/data/stepData'
import runMiddlewareChain from '../../testutils/runMiddlewareChain'
import { toKebabCase } from '../../utils/utils'
import URLs from '../URLs'
import { StepStatus } from '../../@types/StepType'

jest.mock('../../services/sentence-plan/stepsService', () => {
  return jest.fn().mockImplementation(() => ({
    getSteps: jest.fn().mockResolvedValue([
      {
        description: 'A test step',
        actor: 'Test actor',
        status: StepStatus.NOT_STARTED,
      },
    ]),
    saveAllSteps: jest.fn().mockResolvedValue(null),
  }))
})

jest.mock('../../services/sessionService', () => {
  return jest.fn().mockImplementation(() => ({
    getSubjectDetails: jest.fn().mockReturnValue(handoverData.subject),
    getPlanUUID: jest.fn().mockReturnValue('some-plan-uuid'),
    getReturnLink: jest.fn().mockReturnValue('/plan?status=success'),
    setReturnLink: jest.fn(),
  }))
})

jest.mock('../../services/sentence-plan/goalService', () => {
  return jest.fn().mockImplementation(() => ({
    getGoal: jest.fn().mockResolvedValue(testGoal),
  }))
})

describe('AddStepsController', () => {
  let controller: AddStepsController
  let req: Request
  let res: Response
  let next: NextFunction

  const viewData = {
    locale: locale.en,
    data: {
      popData: handoverData.subject,
      areaOfNeed: toKebabCase(testGoal.areaOfNeed.name),
      goal: testGoal,
      form: {
        steps: [
          {
            description: testStep.description,
            actor: testStep.actor,
            status: testStep.status,
          },
        ],
      },
    },
    errors: {},
  }

  beforeEach(() => {
    req = mockReq()
    res = mockRes()
    next = jest.fn()

    controller = new AddStepsController()
  })

  describe('get', () => {
    it('should render without validation errors', async () => {
      await controller.get(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/add-steps', viewData)
    })

    it('should render with validation errors', async () => {
      const errors = {
        body: { 'steps.0.description': { isNotEmpty: true } },
        params: {},
        query: {},
      }
      req.errors = errors
      const expectedViewData = {
        ...viewData,
        errors,
      }

      await controller.get(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/add-steps', expectedViewData)
    })

    it('should call next if getting data fails', async () => {
      const error = new Error('no goal')
      req.services.goalService.getGoal = jest.fn().mockRejectedValue(error)

      await controller.get(req as Request, res as Response, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('post', () => {
    describe('validation', () => {})

    it('should remove a step and re-render the page', async () => {
      req.body = {
        action: 'remove-step-2',
        'step-actor-1': 'Test actor',
        'step-description-1': 'a test step',
        'step-actor-2': 'Batman',
        'step-description-2': 'test',
      }

      const expectedData = { ...viewData }
      expectedData.data.form = {
        'step-actor-1': 'Test actor',
        'step-description-1': 'a test step',
        steps: [
          {
            actor: 'Test actor',
            description: 'a test step',
          },
        ],
      } as any

      await runMiddlewareChain(controller.post, req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/add-steps', expectedData)
      expect(next).not.toHaveBeenCalled()
    })

    it('should add a new step and re-render the page', async () => {
      req.body = {
        action: 'add-step',
        'step-actor-1': 'Test actor',
        'step-description-1': 'a test step',
        'step-status-1': StepStatus.NOT_STARTED,
        'step-actor-2': 'Batman',
        'step-description-2': 'test',
        'step-status-2': StepStatus.IN_PROGRESS,
      }

      const expectedData = { ...viewData }
      expectedData.data.form = {
        'step-actor-1': 'Test actor',
        'step-description-1': 'a test step',
        'step-status-1': StepStatus.NOT_STARTED,
        'step-actor-2': 'Batman',
        'step-description-2': 'test',
        'step-status-2': StepStatus.IN_PROGRESS,
        steps: [
          {
            actor: 'Test actor',
            description: 'a test step',
            status: StepStatus.NOT_STARTED,
          },
          {
            actor: 'Batman',
            description: 'test',
            status: StepStatus.IN_PROGRESS,
          },
          {
            actor: 'Buster',
            description: '',
            status: StepStatus.NOT_STARTED,
          },
        ],
      } as any

      await runMiddlewareChain(controller.post, req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/add-steps', expectedData)
      expect(next).not.toHaveBeenCalled()
    })

    it('should save and redirect when action is not "add-step" or "remove-step"', async () => {
      req.body = {
        action: 'save',
        'step-actor-1': 'Test actor',
        'step-description-1': 'a test step',
        'step-status-1': StepStatus.NOT_STARTED,
        'step-actor-2': 'Batman',
        'step-description-2': 'test',
        'step-status-2': StepStatus.IN_PROGRESS,
      }
      req.params = { uuid: 'some-goal-uuid' }

      const expectedData = [
        {
          description: 'a test step',
          status: StepStatus.NOT_STARTED,
          actor: 'Test actor',
        },
        {
          description: 'test',
          status: StepStatus.IN_PROGRESS,
          actor: 'Batman',
        },
      ]

      await runMiddlewareChain(controller.post, req, res, next)

      expect(req.services.stepService.saveAllSteps).toHaveBeenCalledWith(expectedData, 'some-goal-uuid')
      expect(res.redirect).toHaveBeenCalledWith(`${URLs.PLAN_OVERVIEW}?status=success`)
      expect(next).not.toHaveBeenCalled()
    })

    it('should render the form again if there are validation errors', async () => {
      req.body = {
        action: 'save',
        'step-actor-1': 'Batman',
        'step-description-1': '',
      }
      req.params = { uuid: 'some-goal-uuid' }

      const expectedViewData = {
        locale: locale.en,
        data: {
          popData: viewData.data.popData,
          areaOfNeed: viewData.data.areaOfNeed,
          goal: viewData.data.goal,
          form: {
            action: 'save',
            'step-actor-1': 'Batman',
            'step-description-1': '',
            steps: [
              {
                actor: 'Batman',
                description: '',
              },
            ],
          },
        },
        errors: req.errors,
      }

      await runMiddlewareChain(controller.post, req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/add-steps', expectedViewData)
      expect(next).not.toHaveBeenCalled()
    })

    it('should call next with an error if saveAllSteps fails', async () => {
      req.body = {
        action: 'save',
        'step-actor-1': 'Batman',
        'step-description-1': 'a test step',
        'step-status-1': StepStatus.NOT_STARTED,
      }
      req.params = { uuid: 'some-goal-uuid' }

      const saveError = new Error('Save failed')
      req.services.stepService.saveAllSteps = jest.fn().mockRejectedValue(saveError)

      await runMiddlewareChain(controller.post, req, res, next)

      expect(next).toHaveBeenCalledWith(saveError)

      expect(res.render).not.toHaveBeenCalled()
    })
  })
})
