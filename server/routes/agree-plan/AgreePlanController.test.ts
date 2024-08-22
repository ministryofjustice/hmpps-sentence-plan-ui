import { NextFunction, Request, Response } from 'express'
import { plainToInstance } from 'class-transformer'
import handoverData from '../../testutils/data/handoverData'
import testPlan from '../../testutils/data/planData'
import AgreePlanController from './AgreePlanController'
import PlanService from '../../services/sentence-plan/planService'
import mockReq from '../../testutils/preMadeMocks/mockReq'
import mockRes from '../../testutils/preMadeMocks/mockRes'
import { getValidationErrors } from '../../middleware/validationMiddleware'
import { getValidationErrors } from '../../middleware/validationMiddleware'
import locale from './locale.json'
import runMiddlewareChain from '../../testutils/runMiddlewareChain'
import AgreePlanPostModel from './models/AgreePlanPostModel'
import runMiddlewareChain from '../../testutils/runMiddlewareChain'

jest.mock('../../services/sessionService', () => {
  return jest.fn().mockImplementation(() => ({
    getPlanUUID: jest.fn().mockReturnValue(testPlan.uuid),
    getPrincipalDetails: jest.fn().mockReturnValue(testHandoverContext.principal),
    getSubjectDetails: jest.fn().mockReturnValue(testHandoverContext.subject),
  }))
})

jest.mock('../../services/sentence-plan/planService', () => {
  return jest.fn().mockImplementation(() => ({
    agreePlan: jest.fn().mockResolvedValue(testPlan),
    getPlanByUuid: jest.fn().mockResolvedValue(testPlan),
  }))
})

describe('AgreePlanController', () => {
  let controller: AgreePlanController
  let mockPlanService: jest.Mocked<PlanService>
  let req: Request
  let res: Response
  let next: NextFunction
  const viewData = {
    data: {
      form: {},
    },
    errors: {},
    locale: locale.en,
  }

  beforeEach(() => {
    mockPlanService = new PlanService(null) as jest.Mocked<PlanService>
    req = mockReq()
    res = mockRes()
    next = jest.fn()

    controller = new AgreePlanController(mockPlanService)
  })

  describe('get', () => {
    describe('validation', () => {
      describe('goals', () => {
        it('should add error if no goals', () => {
          const badPlanData: PlanType = { ...testPlan, goals: [] }

          const dataToBeValidated = plainToInstance(PlanModel, badPlanData)
          const errors = getValidationErrors(dataToBeValidated)

          expect(errors).toMatchObject({
            goals: { arrayNotEmpty: true },
          })
        })
      })

      describe('steps', () => {
        it('should add error if current goal has no steps', () => {
          const badPlanData: Partial<PlanType> = {
            ...testPlan,
            goals: [{ ...testGoal, steps: [] }],
          }

          const dataToBeValidated = plainToInstance(PlanModel, badPlanData)
          const errors = getValidationErrors(dataToBeValidated)

          expect(errors).toMatchObject({
            'goals.0.steps': { arrayNotEmpty: true },
          })
        })
      })
    })

    it('should render without validation errors', async () => {
      await runMiddlewareChain(controller.get, req, res, next)

      expect(mockPlanService.agreePlan).not.toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('pages/agree-plan', viewData)
    })

    it('should redirect if plan has validation errors', async () => {
      const badPlanData: PlanType = { ...testPlan, goals: [] }

      mockPlanService.getPlanByUuid = jest.fn().mockResolvedValue(badPlanData)
      await runMiddlewareChain(controller.get, req, res, next)

      expect(mockPlanService.agreePlan).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith(URLs.PLAN_SUMMARY)
    })

    it('should redirect if plan is not in draft', async () => {
      const badPlanData: PlanType = { ...testPlan, agreementStatus: PlanAgreementStatus.AGREED }

      mockPlanService.getPlanByUuid = jest.fn().mockResolvedValue(badPlanData)
      await runMiddlewareChain(controller.get, req, res, next)

      expect(mockPlanService.agreePlan).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith(URLs.PLAN_SUMMARY)
    })

    it('should call next if error', async () => {
      const error = new Error('fail')
      mockPlanService.getPlanByUuid = jest.fn().mockRejectedValue(error)
      await runMiddlewareChain(controller.get, req, res, next)

      expect(mockPlanService.agreePlan).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('post', () => {
    describe('validation', () => {
      describe('agree-plan-radio', () => {
        it('should add error if not selected', () => {
          const body = plainToInstance(AgreePlanPostModel, req.body)
          const errors = getValidationErrors(body)

          expect(errors).toMatchObject({
            'agree-plan-radio': { isNotEmpty: true },
          })
        })

        it('should add error if "no" is selected and details are missing', () => {
          req.body['agree-plan-radio'] = 'no'
          const body = plainToInstance(AgreePlanPostModel, req.body)
          const errors = getValidationErrors(body)

          expect(errors).toMatchObject({
            'does-not-agree-details': { isNotEmpty: true },
          })
        })

        it('should add error if "couldNotAnswer" is selected and details are missing', () => {
          req.body['agree-plan-radio'] = 'couldNotAnswer'
          const body = plainToInstance(AgreePlanPostModel, req.body)
          const errors = getValidationErrors(body)

          expect(errors).toMatchObject({
            'could-not-answer-details': { isNotEmpty: true },
          })
        })
      })
    })

    it('should render the form again if there are validation errors', async () => {
      const errors = {
        body: { 'agree-plan-radio': { isNotEmpty: true } },
        params: {},
        query: {},
      }
      req.errors = errors
      const expectedViewData = {
        ...viewData,
        errors,
      }

      await runMiddlewareChain(controller.post, req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/agree-plan', expectedViewData)
      expect(mockPlanService.agreePlan).not.toHaveBeenCalled()
      expect(res.redirect).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    it('should render the form again if there are validation errors', async () => {
      req.body = {
        'agree-plan-radio': 'no',
      }
      req.method = 'POST'
      const expectedViewData = {
        ...viewData,
        data: {
          form: {
            'agree-plan-radio': 'no',
          },
        },
        errors: {
          body: {
            'does-not-agree-details': {
              isNotEmpty: true,
            },
          },
          params: {},
          query: {},
        },
      }

      await runMiddlewareChain(controller.post, req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/agree-plan', expectedViewData)
      expect(mockPlanService.agreePlan).not.toHaveBeenCalled()
      expect(res.redirect).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    it('should agree plan and redirect if no validation errors', async () => {
      req.body = {
        notes: 'test note',
        'agree-plan-radio': 'yes',
      }
      req.method = 'POST'
      const expectedAgreementData = {
        agreementStatus: PlanAgreementStatus.AGREED,
        agreementStatusNote: '',
        optionalNote: 'test note',
        personName: `${testHandoverContext.subject.givenName} ${testHandoverContext.subject.familyName}`,
        practitionerName: testHandoverContext.principal.displayName,
      }

      await runMiddlewareChain(controller.post, req, res, next)

      expect(mockPlanService.agreePlan).toHaveBeenCalledWith(testPlan.uuid, expectedAgreementData)
      expect(res.redirect).toHaveBeenCalledWith(URLs.PLAN_SUMMARY)
      expect(next).not.toHaveBeenCalled()
    })

    it('should agree plan with conditional agreement note details', async () => {
      req.body = {
        notes: 'test note',
        'agree-plan-radio': 'no',
        'does-not-agree-details': 'test agreement detail note',
      }
      req.method = 'POST'
      const expectedAgreementData = {
        agreementStatus: PlanAgreementStatus.DO_NOT_AGREE,
        agreementStatusNote: 'test agreement detail note',
        optionalNote: 'test note',
        personName: `${testHandoverContext.subject.givenName} ${testHandoverContext.subject.familyName}`,
        practitionerName: testHandoverContext.principal.displayName,
      }

      await runMiddlewareChain(controller.post, req, res, next)

      expect(mockPlanService.agreePlan).toHaveBeenCalledWith(testPlan.uuid, expectedAgreementData)
      expect(res.redirect).toHaveBeenCalledWith(URLs.PLAN_SUMMARY)
      expect(next).not.toHaveBeenCalled()
    })

    it('should call next if errors', async () => {
      const error = new Error('fail')
      mockPlanService.agreePlan = jest.fn().mockRejectedValue(error)

      req.body = {
        'agree-plan-radio': 'yes',
      }
      req.method = 'POST'

      await runMiddlewareChain(controller.post, req, res, next)

      expect(mockPlanService.agreePlan).toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })
  })
})
