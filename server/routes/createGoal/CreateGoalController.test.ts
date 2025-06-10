import { NextFunction, Request, Response } from 'express'
import { plainToInstance } from 'class-transformer'
import { AreaOfNeed } from '../../testutils/data/referenceData'
import ReferentialDataService from '../../services/sentence-plan/referentialDataService'
import CreateGoalController from './CreateGoalController'
import mockReq from '../../testutils/preMadeMocks/mockReq'
import mockRes from '../../testutils/preMadeMocks/mockRes'
import locale from './locale.json'
import { getValidationErrors } from '../../middleware/validationMiddleware'
import CreateGoalPostModel from './models/CreateGoalPostModel'
import URLs from '../URLs'
import { testGoal, testNewGoal } from '../../testutils/data/goalData'
import runMiddlewareChain from '../../testutils/runMiddlewareChain'
import testPlan from '../../testutils/data/planData'
import { crimNeedsSubset, incompleteAssessmentData } from '../../testutils/data/testAssessmentData'
import { AuditEvent } from '../../services/auditService'

jest.mock('../../services/auditService')

jest.mock('../../middleware/authorisationMiddleware', () => ({
  requireAccessMode: jest.fn(() => (req: Request, res: Response, next: NextFunction) => {
    return next()
  }),
}))

jest.mock('../../services/sentence-plan/referentialDataService', () => {
  return jest.fn().mockImplementation(() => ({
    getAreasOfNeed: jest.fn().mockReturnValue(AreaOfNeed),
    getSortedAreasOfNeed: jest.fn().mockReturnValue(AreaOfNeed),
  }))
})

jest.mock('../../services/sessionService', () => {
  return jest.fn().mockImplementation(() => ({
    getPlanUUID: jest.fn().mockReturnValue('some-plan-uuid'),
    getCriminogenicNeeds: jest.fn().mockReturnValue(crimNeedsSubset),
    getReturnLink: jest.fn().mockReturnValue('/some-return-link'),
    setReturnLink: jest.fn(),
  }))
})

jest.mock('../../services/sentence-plan/assessmentService', () => {
  return jest.fn().mockImplementation(() => ({
    getAssessmentByUuid: jest.fn().mockResolvedValue(incompleteAssessmentData),
  }))
})

jest.mock('../../services/sentence-plan/goalService', () => {
  return jest.fn().mockImplementation(() => ({
    saveGoal: jest.fn().mockResolvedValue({ uuid: 'new-goal-uuid' }),
  }))
})

jest.mock('../../services/sentence-plan/planService', () => {
  return jest.fn().mockImplementation(() => ({
    getPlanByUuid: jest.fn().mockResolvedValue(testPlan),
  }))
})

describe('CreateGoalController', () => {
  let controller: CreateGoalController
  let mockReferentialDataService: jest.Mocked<ReferentialDataService>
  let req: Request
  let res: Response
  let next: NextFunction
  const viewData = {
    data: {
      planAgreementStatus: testPlan.agreementStatus,
      returnLink: '/plan?type=current',
      areasOfNeed: AreaOfNeed,
      sortedAreasOfNeed: AreaOfNeed,
      form: {},
      selectedAreaOfNeed: AreaOfNeed.find(x => x.url === 'accommodation'),
      minimumDatePickerDate: '01/01/2024',
      assessmentDetailsForArea: {
        isAssessmentSectionNotStarted: false,
        isAssessmentSectionComplete: true,
        motivationToMakeChanges: 'thinkingAboutMakingChanges',
        linkedToHarm: 'NO',
        linkedtoReoffending: 'YES',
        linkedtoStrengthsOrProtectiveFactors: 'NO',
      },
      dateOptions: [
        new Date('2024-04-01T00:00:00.000Z'),
        new Date('2024-07-01T00:00:00.000Z'),
        new Date('2025-01-01T00:00:00.000Z'),
      ],
    },
    errors: {},
    locale: locale.en,
  }

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-01-01'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockReferentialDataService = new ReferentialDataService() as jest.Mocked<ReferentialDataService>
    req = mockReq()
    req.params.areaOfNeed = 'accommodation'
    res = mockRes()
    next = jest.fn()

    controller = new CreateGoalController(mockReferentialDataService)
  })

  describe('get', () => {
    afterEach(() => {
      expect(req.services.auditService.send).not.toHaveBeenCalled()
    })

    it('should render without validation errors', async () => {
      await runMiddlewareChain(controller.get, req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/create-goal', viewData)
    })

    it('should render without errors when assessment info is not available', async () => {
      req.services.assessmentService.getAssessmentByUuid = jest.fn().mockResolvedValue(null)

      const viewDataWithoutAssessment = structuredClone(viewData)
      viewDataWithoutAssessment.data.assessmentDetailsForArea = null

      await runMiddlewareChain(controller.get, req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/create-goal', viewDataWithoutAssessment)
    })

    it('should render with validation errors', async () => {
      const errors = {
        body: { 'date-selection-radio': { isNotEmpty: true } },
        params: {},
        query: {},
      }
      req.errors = errors
      const expectedViewData = {
        ...viewData,
        errors,
      }

      await runMiddlewareChain(controller.get, req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/create-goal', expectedViewData)
    })
  })

  describe('post', () => {
    describe('validation', () => {
      beforeEach(() => {
        req = { body: {} } as Request
      })

      describe('goal-input-autocomplete', () => {
        it('should add error if not provided', () => {
          const body = plainToInstance(CreateGoalPostModel, req.body)
          const errors = getValidationErrors(body)

          expect(errors).toMatchObject({
            'goal-input-autocomplete': { isNotEmpty: true },
          })
        })

        it('should not add error if provided', () => {
          req.body['goal-input-autocomplete'] = 'Title of a goal'
          const body = plainToInstance(CreateGoalPostModel, req.body)
          const errors = getValidationErrors(body)

          expect(errors).not.toMatchObject({
            'goal-input-autocomplete': { isNotEmpty: true },
          })
        })
      })

      describe('related-area-of-need-radio', () => {
        it('should add error if not provided', () => {
          const body = plainToInstance(CreateGoalPostModel, req.body)
          const errors = getValidationErrors(body)

          expect(errors).toMatchObject({
            'related-area-of-need-radio': { isNotEmpty: true },
          })
        })

        it('should not add error if provided', () => {
          req.body['related-area-of-need-radio'] = 'yes'
          const body = plainToInstance(CreateGoalPostModel, req.body)
          const errors = getValidationErrors(body)

          expect(errors).not.toMatchObject({
            'related-area-of-need-radio': { isNotEmpty: true },
          })
        })
      })

      describe('related-area-of-need', () => {
        it('should add error if "related-area-of-need-radio" is "yes" and "other-area-of-need" is not provided', () => {
          req.body['related-area-of-need-radio'] = 'yes'
          const body = plainToInstance(CreateGoalPostModel, req.body)
          const errors = getValidationErrors(body)

          expect(errors).toMatchObject({
            'related-area-of-need': { isNotEmpty: true },
          })
        })

        it('should not add error if "related-area-of-need-radio" is "yes" and "other-area-of-need" is provided', () => {
          req.body['related-area-of-need-radio'] = 'yes'
          req.body['related-area-of-need'] = 'Accommodation'
          const body = plainToInstance(CreateGoalPostModel, req.body)
          const errors = getValidationErrors(body)

          expect(errors).not.toMatchObject({
            'related-area-of-need': { isNotEmpty: true },
          })
        })

        it('should not add error if "related-area-of-need-radio" is not "yes"', () => {
          req.body['related-area-of-need-radio'] = 'no'
          const body = plainToInstance(CreateGoalPostModel, req.body)
          const errors = getValidationErrors(body)

          expect(errors).not.toMatchObject({
            'related-area-of-need': { isNotEmpty: true },
          })
        })
      })

      describe('start-working-goal-radio', () => {
        it('should add error if "start-working-goal-radio" is not provided', () => {
          const body = plainToInstance(CreateGoalPostModel, req.body)
          const errors = getValidationErrors(body)

          expect(errors).toMatchObject({
            'start-working-goal-radio': { isNotEmpty: true },
          })
        })

        it('should not add error if "start-working-goal-radio" is provided', () => {
          req.body['start-working-goal-radio'] = 'yes'
          const body = plainToInstance(CreateGoalPostModel, req.body)
          const errors = getValidationErrors(body)

          expect(errors).not.toMatchObject({
            'start-working-goal-radio': { isNotEmpty: true },
          })
        })
      })

      describe('date-selection', () => {
        it('should add error if "date-selection-radio" is not provided', () => {
          req.body['start-working-goal-radio'] = 'yes'
          const body = plainToInstance(CreateGoalPostModel, req.body)
          const errors = getValidationErrors(body)

          expect(errors).toMatchObject({
            'date-selection-radio': { isNotEmpty: true },
          })
        })

        it('should not add error if "date-selection-radio" is provided', () => {
          req.body['start-working-goal-radio'] = 'yes'
          req.body['date-selection-radio'] = 'custom'
          const today = new Date()
          req.body['date-selection-custom'] = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`
          const body = plainToInstance(CreateGoalPostModel, req.body)
          const errors = getValidationErrors(body)

          expect(errors).not.toMatchObject({
            'date-selection-radio': { isNotEmpty: true },
          })
        })

        it('should add error if "date-selection-radio" is "custom", and "date-selection-custom" is not provided', () => {
          req.body['start-working-goal-radio'] = 'yes'
          req.body['date-selection-radio'] = 'custom'
          const body = plainToInstance(CreateGoalPostModel, req.body)
          const errors = getValidationErrors(body)

          expect(errors).toMatchObject({
            'date-selection-custom': { isNotEmpty: true },
          })
        })

        it('should add error if "date-selection-radio" is "custom", and "date-selection-custom" is in the past', () => {
          req.body['start-working-goal-radio'] = 'yes'
          req.body['date-selection-radio'] = 'custom'
          const today = new Date()
          req.body['date-selection-custom'] = `${today.getDate() - 1}/${today.getMonth() + 1}/${today.getFullYear()}`
          const body = plainToInstance(CreateGoalPostModel, req.body)
          const errors = getValidationErrors(body)

          expect(errors).toMatchObject({
            'date-selection-custom': { GoalDateMustBeTodayOrFuture: true },
          })
        })

        it('should not add error if "date-selection-radio" is "custom", and "date-selection-custom" is provided', () => {
          req.body['start-working-goal-radio'] = 'yes'
          req.body['date-selection-radio'] = 'custom'
          const today = new Date()
          req.body['date-selection-custom'] = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`
          const body = plainToInstance(CreateGoalPostModel, req.body)
          const errors = getValidationErrors(body)

          expect(errors).not.toMatchObject({
            'date-selection-custom': { isNotEmpty: true },
          })
        })
      })
    })

    it('should save and redirect when there are no validation errors and action is not "addStep"', async () => {
      req.body = {
        'goal-input-autocomplete': testGoal.title,
        'area-of-need': testGoal.areaOfNeed.name,
        'related-area-of-need-radio': 'yes',
        'related-area-of-need': testNewGoal.relatedAreasOfNeed,
        'start-working-goal-radio': 'yes',
        'date-selection-radio': testGoal.targetDate,
        action: 'saveWithoutSteps',
      }
      req.errors = { body: {} }

      await runMiddlewareChain(controller.post, req, res, next)

      expect(req.services.goalService.saveGoal).toHaveBeenCalledWith(testNewGoal, 'some-plan-uuid')
      expect(res.redirect).toHaveBeenCalledWith(`${URLs.PLAN_OVERVIEW}?status=added&type=current`)
      expect(res.render).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
      expect(req.services.auditService.send).toHaveBeenCalledWith(AuditEvent.CREATE_A_GOAL, {
        goalUUID: 'new-goal-uuid',
      })
    })

    it('should save and redirect to create step when action is "addStep"', async () => {
      req.body = {
        'goal-input-autocomplete': testGoal.title,
        'area-of-need': testGoal.areaOfNeed.name,
        'related-area-of-need-radio': 'yes',
        'related-area-of-need': testNewGoal.relatedAreasOfNeed,
        'start-working-goal-radio': 'yes',
        'date-selection-radio': testGoal.targetDate,
        action: 'addStep',
      }
      req.errors = { body: {} }

      await runMiddlewareChain(controller.post, req, res, next)

      expect(req.services.goalService.saveGoal).toHaveBeenCalledWith(testNewGoal, 'some-plan-uuid')
      expect(res.redirect).toHaveBeenCalledWith(`${URLs.ADD_STEPS.replace(':uuid', 'new-goal-uuid')}?type=current`)
      expect(res.render).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
      expect(req.services.auditService.send).toHaveBeenCalledWith(AuditEvent.CREATE_A_GOAL, {
        goalUUID: 'new-goal-uuid',
      })
    })

    it('should render the form again if there are validation errors', async () => {
      const errors = {
        body: { 'date-selection-radio': { isNotEmpty: true } },
        params: {},
        query: {},
      }
      req.errors = errors
      const expectedViewData = {
        ...viewData,
        errors,
      }

      await runMiddlewareChain(controller.post, req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/create-goal', expectedViewData)
      expect(req.services.goalService.saveGoal).not.toHaveBeenCalled()
      expect(res.redirect).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
      expect(req.services.auditService.send).not.toHaveBeenCalled()
    })

    it('should call next with an error if saveGoal fails', async () => {
      req.body = {
        'goal-input-autocomplete': testGoal.title,
        'area-of-need': testGoal.areaOfNeed.name,
        'related-area-of-need-radio': 'yes',
        'related-area-of-need': testNewGoal.relatedAreasOfNeed,
        'start-working-goal-radio': 'yes',
        'date-selection-radio': testGoal.targetDate,
        action: 'addStep',
      }
      req.errors = { body: {} }

      const error = new Error('This is a test error')
      req.services.goalService.saveGoal = jest.fn().mockRejectedValue(error)

      await runMiddlewareChain(controller.post, req, res, next)

      expect(next).toHaveBeenCalledWith(error)
      expect(res.render).not.toHaveBeenCalled()
      expect(res.redirect).not.toHaveBeenCalled()
      expect(req.services.auditService.send).not.toHaveBeenCalled()
    })
  })
})
