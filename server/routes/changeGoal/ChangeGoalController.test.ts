import { NextFunction, Request, Response } from 'express'
import { plainToInstance } from 'class-transformer'
import { AreaOfNeed } from '../../testutils/data/referenceData'
import ReferentialDataService from '../../services/sentence-plan/referentialDataService'
import ChangeGoalController from './ChangeGoalController'
import mockReq from '../../testutils/preMadeMocks/mockReq'
import mockRes from '../../testutils/preMadeMocks/mockRes'
import { testGoal } from '../../testutils/data/goalData'
import locale from './locale.json'
import { getValidationErrors } from '../../middleware/validationMiddleware'
import ChangeGoalPostModel from './models/ChangeGoalPostModel'
import { NewGoal } from '../../@types/NewGoalType'
import runMiddlewareChain from '../../testutils/runMiddlewareChain'
import testPlan from '../../testutils/data/planData'
import { PlanAgreementStatus, PlanType } from '../../@types/PlanType'
import { Goal } from '../../@types/GoalType'
import CreateGoalPostModel from '../createGoal/models/CreateGoalPostModel'
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
    getSortedAreasOfNeed: jest.fn().mockReturnValue(AreaOfNeed),
  }))
})

jest.mock('../../services/sessionService', () => {
  return jest.fn().mockImplementation(() => ({
    getCriminogenicNeeds: jest.fn().mockReturnValue(crimNeedsSubset),
    getPlanUUID: jest.fn().mockReturnValue(testPlan.uuid),
    getReturnLink: jest.fn().mockReturnValue('/some-return-link'),
  }))
})

jest.mock('../../services/sentence-plan/assessmentService', () => {
  return jest.fn().mockImplementation(() => ({
    getAssessmentByUuid: jest.fn().mockResolvedValue(incompleteAssessmentData),
  }))
})

jest.mock('../../services/sentence-plan/planService', () => {
  return jest.fn().mockImplementation(() => ({
    getPlanByUuid: jest.fn().mockResolvedValue(testPlan),
  }))
})

jest.mock('../../services/sentence-plan/goalService', () => {
  return jest.fn().mockImplementation(() => ({
    getGoal: jest.fn().mockReturnValue(testGoal),
    replaceGoal: jest.fn().mockReturnValue(testGoal),
  }))
})

describe('ChangeGoalController', () => {
  let controller: ChangeGoalController
  let mockReferentialDataService: jest.Mocked<ReferentialDataService>
  let req: Request
  let res: Response
  let next: NextFunction
  const viewData = {
    data: {
      planAgreementStatus: testPlan.agreementStatus,
      sortedAreasOfNeed: AreaOfNeed,
      returnLink: '/some-return-link',
      form: {},
      assessmentDetailsForArea: {
        isAssessmentSectionNotStarted: false,
        isAssessmentSectionComplete: true,
        motivationToMakeChanges: 'needsHelpToMakeChanges',
        linkedToHarm: 'NO',
        linkedtoReoffending: 'NO',
        linkedtoStrengthsOrProtectiveFactors: 'NO',
      },
      selectedAreaOfNeed: AreaOfNeed.find(x => x.name === testGoal.areaOfNeed.name),
      minimumDatePickerDate: '01/01/2024',
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
    // jest.clearAllMocks()
    mockReferentialDataService = new ReferentialDataService() as jest.Mocked<ReferentialDataService>
    req = mockReq()
    res = mockRes()
    next = jest.fn()

    controller = new ChangeGoalController(mockReferentialDataService)
  })

  describe('get', () => {
    it('should render without validation errors', async () => {
      await runMiddlewareChain(controller.get, req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/change-goal', viewData)
      expect(req.services.auditService.send).not.toHaveBeenCalled()
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

      expect(res.render).toHaveBeenCalledWith('pages/change-goal', expectedViewData)
      expect(req.services.auditService.send).not.toHaveBeenCalled()
    })
  })

  describe('post', () => {
    describe('validation', () => {
      beforeEach(() => {
        req = { body: {} } as Request
      })

      describe('goal-input-autocomplete', () => {
        it('should add error if not provided', () => {
          const body = plainToInstance(ChangeGoalPostModel, req.body)
          const errors = getValidationErrors(body)

          expect(errors).toMatchObject({
            'goal-input-autocomplete': { isNotEmpty: true },
          })
        })

        it('should not add error if provided', () => {
          req.body['goal-input-autocomplete'] = 'Title of a goal'
          const body = plainToInstance(ChangeGoalPostModel, req.body)
          const errors = getValidationErrors(body)

          expect(errors).not.toMatchObject({
            'goal-input-autocomplete': { isNotEmpty: true },
          })
        })
      })

      describe('related-area-of-need-radio', () => {
        it('should add error if not provided', () => {
          const body = plainToInstance(ChangeGoalPostModel, req.body)
          const errors = getValidationErrors(body)

          expect(errors).toMatchObject({
            'related-area-of-need-radio': { isNotEmpty: true },
          })
        })

        it('should not add error if provided', () => {
          req.body['related-area-of-need-radio'] = 'yes'
          const body = plainToInstance(ChangeGoalPostModel, req.body)
          const errors = getValidationErrors(body)

          expect(errors).not.toMatchObject({
            'related-area-of-need-radio': { isNotEmpty: true },
          })
        })
      })

      describe('related-area-of-need', () => {
        it('should add error if "related-area-of-need-radio" is "yes" and "related-area-of-need" is not provided', () => {
          req.body['related-area-of-need-radio'] = 'yes'
          const body = plainToInstance(ChangeGoalPostModel, req.body)
          const errors = getValidationErrors(body)

          expect(errors).toMatchObject({
            'related-area-of-need': { isNotEmpty: true },
          })
        })

        it('should not add error if "related-area-of-need-radio" is "yes" and "related-area-of-need" is provided', () => {
          req.body['related-area-of-need-radio'] = 'yes'
          req.body['related-area-of-need'] = 'Accommodation'
          const body = plainToInstance(ChangeGoalPostModel, req.body)
          const errors = getValidationErrors(body)

          expect(errors).not.toMatchObject({
            'related-area-of-need': { isNotEmpty: true },
          })
        })

        it('should not add error if "related-area-of-need-radio" is not "yes"', () => {
          req.body['related-area-of-need-radio'] = 'no'
          const body = plainToInstance(ChangeGoalPostModel, req.body)
          const errors = getValidationErrors(body)

          expect(errors).not.toMatchObject({
            'related-area-of-need': { isNotEmpty: true },
          })
        })
      })

      describe('start-working-goal-radio', () => {
        it('should add error if "start-working-goal-radio" is not provided', () => {
          const body = plainToInstance(ChangeGoalPostModel, req.body)
          const errors = getValidationErrors(body)

          expect(errors).toMatchObject({
            'start-working-goal-radio': { isNotEmpty: true },
          })
        })

        it('should not add error if "start-working-goal-radio" is provided', () => {
          req.body['start-working-goal-radio'] = 'yes'
          const body = plainToInstance(ChangeGoalPostModel, req.body)
          const errors = getValidationErrors(body)

          expect(errors).not.toMatchObject({
            'start-working-goal-radio': { isNotEmpty: true },
          })
        })
      })

      describe('date-selection', () => {
        it('should add error if "date-selection-radio" is not provided', () => {
          req.body['start-working-goal-radio'] = 'yes'
          const body = plainToInstance(ChangeGoalPostModel, req.body)
          const errors = getValidationErrors(body)

          expect(errors).toMatchObject({
            'date-selection-radio': { isNotEmpty: true },
          })
        })

        it('should not add error if "date-selection-radio" is provided', () => {
          req.body['start-working-goal-radio'] = 'yes'
          req.body['date-selection-radio'] = 'custom'
          const body = plainToInstance(ChangeGoalPostModel, req.body)
          const errors = getValidationErrors(body)

          expect(errors).not.toMatchObject({
            'date-selection-radio': { isNotEmpty: true },
          })
        })

        it('should add error if "date-selection-radio" is "custom", and "date-selection-custom" is not provided', () => {
          req.body['start-working-goal-radio'] = 'yes'
          req.body['date-selection-radio'] = 'custom'
          const body = plainToInstance(ChangeGoalPostModel, req.body)
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
          const body = plainToInstance(ChangeGoalPostModel, req.body)
          const errors = getValidationErrors(body)

          expect(errors).not.toMatchObject({
            'date-selection-custom': { isNotEmpty: true },
          })
        })
      })
    })

    it('should redirect to /plan if Plan is not agreed', async () => {
      const updatedGoal: NewGoal = {
        title: 'A new title for the test goal',
        areaOfNeed: testGoal.areaOfNeed.name,
        targetDate: viewData.data.dateOptions[1].toISOString(),
        relatedAreasOfNeed: undefined,
        status: undefined,
      }

      req.body = {
        'goal-input-autocomplete': updatedGoal.title,
        'area-of-need': updatedGoal.areaOfNeed,
        'related-area-of-need-radio': 'no',
        'start-working-goal-radio': 'yes',
        'date-selection-radio': updatedGoal.targetDate,
      }
      req.errors = {
        body: {},
      }
      req.params.uuid = testGoal.uuid

      await runMiddlewareChain(controller.post, req, res, next)

      expect(req.services.goalService.replaceGoal).toHaveBeenCalledWith(updatedGoal, testGoal.uuid)
      expect(res.redirect).toHaveBeenCalledWith(`/plan?status=changed&type=current`)
      expect(res.render).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
      expect(req.services.auditService.send).toHaveBeenCalledWith(AuditEvent.CHANGE_A_GOAL, { goalUUID: testGoal.uuid })
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

      expect(res.render).toHaveBeenCalledWith('pages/change-goal', expectedViewData)
      expect(req.services.auditService.send).not.toHaveBeenCalled()
    })

    it('should return error page if there is an error saving the goal', async () => {
      const updatedGoal: NewGoal = {
        title: 'A new title for the test goal',
        areaOfNeed: testGoal.areaOfNeed.name,
        targetDate: viewData.data.dateOptions[1].toISOString(),
      }

      req.body = {
        'goal-input-autocomplete': updatedGoal.title,
        'area-of-need': updatedGoal.areaOfNeed,
        'related-area-of-need-radio': 'no',
        'start-working-goal-radio': 'yes',
        'date-selection-radio': updatedGoal.targetDate,
      }
      req.errors = {
        body: {},
      }
      const error = new Error('This is a test error')
      req.services.goalService.replaceGoal = jest.fn().mockRejectedValue(error)
      await runMiddlewareChain(controller.post, req, res, next)

      expect(next).toHaveBeenCalledWith(error)
      expect(req.services.auditService.send).not.toHaveBeenCalled()
    })

    it('should redirect to update-goal-steps if Plan is agreed and goal.type==current ', async () => {
      const draftPlanData: PlanType = { ...testPlan, agreementStatus: PlanAgreementStatus.AGREED }
      req.services.planService.getPlanByUuid = jest.fn().mockResolvedValue(draftPlanData)

      const updatedGoal: NewGoal = {
        title: 'A new title for the test goal',
        areaOfNeed: testGoal.areaOfNeed.name,
        targetDate: viewData.data.dateOptions[1].toISOString(),
        relatedAreasOfNeed: undefined,
        status: undefined,
      }

      req.body = {
        'goal-input-autocomplete': updatedGoal.title,
        'area-of-need': updatedGoal.areaOfNeed,
        'related-area-of-need-radio': 'no',
        'start-working-goal-radio': 'yes',
        'date-selection-radio': updatedGoal.targetDate,
      }
      req.errors = {
        body: {},
      }
      req.params.uuid = testGoal.uuid

      await runMiddlewareChain(controller.post, req, res, next)

      expect(req.services.goalService.replaceGoal).toHaveBeenCalledWith(updatedGoal, testGoal.uuid)
      expect(res.redirect).toHaveBeenCalledWith(`/update-goal-steps/${testGoal.uuid}`)
      expect(res.render).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
      expect(req.services.auditService.send).toHaveBeenCalledWith(AuditEvent.CHANGE_A_GOAL, { goalUUID: testGoal.uuid })
    })

    it('should redirect to update-goal-steps if Plan is agreed and future goal has steps', async () => {
      const draftPlanData: PlanType = { ...testPlan, agreementStatus: PlanAgreementStatus.AGREED }
      req.services.planService.getPlanByUuid = jest.fn().mockResolvedValue(draftPlanData)

      req.body = {
        'goal-input-autocomplete': 'Goal for the future with steps',
        'area-of-need': testGoal.areaOfNeed.name,
        'related-area-of-need-radio': 'no',
        'start-working-goal-radio': 'no',
      }
      req.errors = {
        body: {},
      }
      req.params.uuid = testGoal.uuid

      await runMiddlewareChain(controller.post, req, res, next)
      expect(res.redirect).toHaveBeenCalledWith(`/update-goal-steps/${testGoal.uuid}`)
      expect(req.services.auditService.send).toHaveBeenCalledWith(AuditEvent.CHANGE_A_GOAL, { goalUUID: testGoal.uuid })
    })

    it('should redirect to add-steps if came from add-steps and user clicked the back link', async () => {
      const draftPlanData: PlanType = { ...testPlan, agreementStatus: PlanAgreementStatus.DRAFT }
      req.services.planService.getPlanByUuid = jest.fn().mockResolvedValue(draftPlanData)

      const testGoalWithNoSteps: Goal = { ...testGoal, steps: [] }
      req.services.goalService.getGoal = jest.fn().mockReturnValue(testGoalWithNoSteps)
      req.services.sessionService.getReturnLink = jest.fn().mockReturnValue(`/change-goal/${testGoal.uuid}/`)
      req.services.sessionService.setReturnLink = jest.fn()

      req.body = {
        'goal-input-autocomplete': 'Goal for the future with no steps',
        'area-of-need': testGoal.areaOfNeed.name,
        'related-area-of-need-radio': 'no',
        'start-working-goal-radio': 'yes',
        'date-selection-radio': viewData.data.dateOptions[1].toISOString(),
      }
      req.errors = {
        body: {},
      }
      req.params.uuid = testGoal.uuid

      await runMiddlewareChain(controller.post, req, res, next)
      expect(res.redirect).toHaveBeenCalledWith(`/goal/${testGoal.uuid}/add-steps`)
      expect(req.services.auditService.send).toHaveBeenCalledWith(AuditEvent.CHANGE_A_GOAL, { goalUUID: testGoal.uuid })
    })

    it('should redirect to add-steps if Plan is agreed and current goal has no steps', async () => {
      const draftPlanData: PlanType = { ...testPlan, agreementStatus: PlanAgreementStatus.AGREED }
      req.services.planService.getPlanByUuid = jest.fn().mockResolvedValue(draftPlanData)

      const testGoalWithNoSteps: Goal = { ...testGoal, steps: [] }
      req.services.goalService.getGoal = jest.fn().mockReturnValue(testGoalWithNoSteps)

      req.body = {
        'goal-input-autocomplete': 'Goal for the future with no steps',
        'area-of-need': testGoal.areaOfNeed.name,
        'related-area-of-need-radio': 'no',
        'start-working-goal-radio': 'yes',
        'date-selection-radio': viewData.data.dateOptions[1].toISOString(),
      }
      req.errors = {
        body: {},
      }
      req.params.uuid = testGoal.uuid

      await runMiddlewareChain(controller.post, req, res, next)
      expect(res.redirect).toHaveBeenCalledWith(`/goal/${testGoal.uuid}/add-steps`)
      expect(req.services.auditService.send).toHaveBeenCalledWith(AuditEvent.CHANGE_A_GOAL, { goalUUID: testGoal.uuid })
    })
  })
})
