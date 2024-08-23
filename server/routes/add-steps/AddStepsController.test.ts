import { NextFunction, Request, Response } from 'express'
import AddStepsController from './AddStepsController'
import StepService from '../../services/sentence-plan/stepsService'
import GoalService from '../../services/sentence-plan/goalService'
import mockReq from '../../testutils/preMadeMocks/mockReq'
import mockRes from '../../testutils/preMadeMocks/mockRes'
import locale from './locale.json'
import { testGoal } from '../../testutils/data/goalData'
import handoverData from '../../testutils/data/handoverData'
import { testStep } from '../../testutils/data/stepData'
import runMiddlewareChain from '../../testutils/runMiddlewareChain'
import { toKebabCase } from '../../utils/utils'
import URLs from '../URLs'

jest.mock('../../services/sentence-plan/stepsService', () => {
  return jest.fn().mockImplementation(() => ({
    getSteps: jest.fn().mockResolvedValue([
      {
        description: 'A test step',
        actors: [
          {
            actor: 'Test actor',
            actorOptionId: 1,
          },
        ],
        status: 'PENDING',
      },
    ]),
    saveSteps: jest.fn().mockResolvedValue(null),
  }))
})

jest.mock('../../services/sessionService', () => {
  return jest.fn().mockImplementation(() => ({
    getSubjectDetails: jest.fn().mockReturnValue(handoverData.subject),
    getPlanUUID: jest.fn().mockReturnValue('some-plan-uuid'),
  }))
})

jest.mock('../../services/sentence-plan/goalService', () => {
  return jest.fn().mockImplementation(() => ({
    getGoal: jest.fn().mockResolvedValue(testGoal),
  }))
})

describe('AddStepsController', () => {
  let controller: AddStepsController
  let mockStepService: jest.Mocked<StepService>
  let mockGoalService: jest.Mocked<GoalService>
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
            actor: testStep.actors[0].actor,
          },
        ],
      },
    },
    errors: {},
  }

  beforeEach(() => {
    mockStepService = new StepService(null) as jest.Mocked<StepService>
    mockGoalService = new GoalService(null) as jest.Mocked<GoalService>
    req = mockReq()
    res = mockRes()
    next = jest.fn()

    controller = new AddStepsController(mockStepService, mockGoalService)
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
      mockGoalService.getGoal = jest.fn().mockRejectedValue(error)

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
        'step-actor-2': 'Batman',
        'step-description-2': 'test',
      }

      const expectedData = { ...viewData }
      expectedData.data.form = {
        'step-actor-1': 'Test actor',
        'step-description-1': 'a test step',
        'step-actor-2': 'Batman',
        'step-description-2': 'test',
        steps: [
          {
            actor: 'Test actor',
            description: 'a test step',
          },
          {
            actor: 'Batman',
            description: 'test',
          },
          {
            actor: 'Buster',
            description: '',
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
        'step-actor-2': 'Batman',
        'step-description-2': 'test',
      }
      req.params = { uuid: 'some-goal-uuid' }

      const expectedData = [
        {
          description: 'a test step',
          status: 'in-progress',
          actor: [
            {
              actor: 'Test actor',
              actorOptionId: 0,
            },
          ],
        },
        {
          description: 'test',
          status: 'in-progress',
          actor: [
            {
              actor: 'Batman',
              actorOptionId: 0,
            },
          ],
        },
      ]

      await runMiddlewareChain(controller.post, req, res, next)

      expect(mockStepService.saveSteps).toHaveBeenCalledWith(expectedData, 'some-goal-uuid')
      expect(res.redirect).toHaveBeenCalledWith(`${URLs.PLAN_SUMMARY}?status=success`)
      expect(next).not.toHaveBeenCalled()
    })

    it('should render the form again if there are validation errors', async () => {
      req.body = {
        action: 'save',
        'step-actor-1': 'Batman',
        'step-description-1': '',
      }
      req.params = { uuid: 'some-goal-uuid' }

      // Prepare the expected data for rendering
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

    it('should call next with an error if saveSteps fails', async () => {
      // Set up the request body as needed for the test
      req.body = {
        action: 'save',
        'step-actor-1': 'Batman',
        'step-description-1': 'a test step',
      }
      req.params = { uuid: 'some-goal-uuid' }

      // Mock saveSteps to throw an error
      const saveError = new Error('Save failed')
      mockStepService.saveSteps = jest.fn().mockRejectedValue(saveError)

      // Call the controller's post method, which should trigger saveAndRedirect
      await runMiddlewareChain(controller.post, req, res, next)

      // Expect that the next function was called with the error
      expect(next).toHaveBeenCalledWith(saveError)

      // Ensure res.render was not called since an error occurred
      expect(res.render).not.toHaveBeenCalled()
    })
  })
})
