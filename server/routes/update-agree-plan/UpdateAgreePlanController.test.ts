import { NextFunction, Request, Response } from 'express'
import { plainToInstance } from 'class-transformer'
import { couldNotAnswerTestPlan } from '../../testutils/data/planData'
import UpdateAgreePlanController from './UpdateAgreePlanController'
import mockReq from '../../testutils/preMadeMocks/mockReq'
import mockRes from '../../testutils/preMadeMocks/mockRes'
import { getValidationErrors } from '../../middleware/validationMiddleware'
import locale from './locale.json'
import runMiddlewareChain from '../../testutils/runMiddlewareChain'
import UpdateAgreePlanPostModel from './models/UpdateAgreePlanPostModel'
import URLs from '../URLs'
import { PlanAgreementStatus, PlanType } from '../../@types/PlanType'
import PlanReadyForAgreementModel from '../shared-models/PlanReadyForAgreementModel'
import { testGoal } from '../../testutils/data/goalData'
import testHandoverContext from '../../testutils/data/handoverData'
import { AuditEvent } from '../../services/auditService'

jest.mock('../../services/auditService')

jest.mock('../../middleware/authorisationMiddleware', () => ({
  requireAccessMode: jest.fn(() => (req: Request, res: Response, next: NextFunction) => {
    return next()
  }),
}))

jest.mock('../../services/sessionService', () => {
  return jest.fn().mockImplementation(() => ({
    getPlanUUID: jest.fn().mockReturnValue(couldNotAnswerTestPlan.uuid),
    getPrincipalDetails: jest.fn().mockReturnValue(testHandoverContext.principal),
    getSubjectDetails: jest.fn().mockReturnValue(testHandoverContext.subject),
    getReturnLink: jest.fn().mockReturnValue('/some-return-link'),
  }))
})

jest.mock('../../services/sentence-plan/planService', () => {
  return jest.fn().mockImplementation(() => ({
    agreePlan: jest.fn().mockResolvedValue(couldNotAnswerTestPlan),
    getPlanByUuid: jest.fn().mockResolvedValue(couldNotAnswerTestPlan),
  }))
})

describe('UpdateAgreePlanController', () => {
  let controller: UpdateAgreePlanController
  let req: Request
  let res: Response
  let next: NextFunction
  const viewData = {
    data: {
      planAgreementStatus: couldNotAnswerTestPlan.agreementStatus,
      returnLink: '/some-return-link',
      form: {},
    },
    errors: {},
    locale: locale.en,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    req = mockReq()
    res = mockRes()
    next = jest.fn()

    controller = new UpdateAgreePlanController()
  })

  describe('get', () => {
    describe('validation', () => {
      describe('goals', () => {
        it('should add error if no goals', () => {
          const badPlanData: PlanType = { ...couldNotAnswerTestPlan, goals: [] }

          const dataToBeValidated = plainToInstance(PlanReadyForAgreementModel, badPlanData)
          const errors = getValidationErrors(dataToBeValidated)

          expect(errors).toMatchObject({
            goals: { arrayNotEmpty: true },
          })
        })
      })

      describe('steps', () => {
        it('should add error if current goal has no steps', () => {
          const badPlanData: Partial<PlanType> = {
            ...couldNotAnswerTestPlan,
            goals: [{ ...testGoal, steps: [] }],
          }

          const dataToBeValidated = plainToInstance(PlanReadyForAgreementModel, badPlanData)
          const errors = getValidationErrors(dataToBeValidated)

          expect(errors).toMatchObject({
            'goals.0.steps': { arrayNotEmpty: true },
          })
        })
      })
    })

    afterEach(() => {
      expect(req.services.auditService.send).not.toHaveBeenCalled()
    })

    it('should render without validation errors', async () => {
      await runMiddlewareChain(controller.get, req, res, next)

      expect(req.services.planService.agreePlan).not.toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('pages/update-agree-plan', viewData)
    })

    it('should redirect if plan has validation errors', async () => {
      const badPlanData: PlanType = { ...couldNotAnswerTestPlan, goals: [] }

      req.services.planService.getPlanByUuid = jest.fn().mockResolvedValue(badPlanData)
      await runMiddlewareChain(controller.get, req, res, next)

      expect(req.services.planService.agreePlan).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith(URLs.PLAN_OVERVIEW)
    })

    it('should redirect if plan is not in previously marked as could not agree', async () => {
      const badPlanData: PlanType = { ...couldNotAnswerTestPlan, agreementStatus: PlanAgreementStatus.DRAFT }

      req.services.planService.getPlanByUuid = jest.fn().mockResolvedValue(badPlanData)
      await runMiddlewareChain(controller.get, req, res, next)

      expect(req.services.planService.agreePlan).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith(URLs.PLAN_OVERVIEW)
    })

    it('should call next if error', async () => {
      const error = new Error('fail')
      req.services.planService.getPlanByUuid = jest.fn().mockRejectedValue(error)
      await runMiddlewareChain(controller.get, req, res, next)

      expect(req.services.planService.agreePlan).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('post', () => {
    describe('validation', () => {
      describe('agree-plan-radio', () => {
        it('should add error if not selected', () => {
          const body = plainToInstance(UpdateAgreePlanPostModel, req.body)
          const errors = getValidationErrors(body)

          expect(errors).toMatchObject({
            'agree-plan-radio': { isIn: true },
          })
        })

        it('should add error if "no" is selected and details are missing', () => {
          req.body['agree-plan-radio'] = 'no'
          const body = plainToInstance(UpdateAgreePlanPostModel, req.body)
          const errors = getValidationErrors(body)

          expect(errors).toMatchObject({
            'does-not-agree-details': { isNotEmpty: true },
          })
        })
      })
    })

    it('should render the form again if there are validation errors', async () => {
      req.body = {
        'agree-plan-radio': 'no',
        'does-not-agree-details': '',
      }
      req.method = 'POST'
      const expectedViewData = {
        ...viewData,
        data: {
          planAgreementStatus: couldNotAnswerTestPlan.agreementStatus,
          returnLink: '/some-return-link',
          form: {
            'agree-plan-radio': 'no',
            'does-not-agree-details': '',
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

      expect(res.render).toHaveBeenCalledWith('pages/update-agree-plan', expectedViewData)
      expect(req.services.planService.agreePlan).not.toHaveBeenCalled()
      expect(res.redirect).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
      expect(req.services.auditService.send).not.toHaveBeenCalled()
    })

    it('should agree plan and redirect if no validation errors', async () => {
      req.body = {
        notes: 'test note',
        'agree-plan-radio': 'yes',
      }
      req.method = 'POST'
      const expectedAgreementData = {
        agreementStatus: PlanAgreementStatus.UPDATED_AGREED,
        agreementStatusNote: '',
        optionalNote: '',
        personName: `${testHandoverContext.subject.givenName} ${testHandoverContext.subject.familyName}`,
        practitionerName: testHandoverContext.principal.displayName,
      }

      await runMiddlewareChain(controller.post, req, res, next)

      expect(req.services.planService.agreePlan).toHaveBeenCalledWith(
        couldNotAnswerTestPlan.uuid,
        expectedAgreementData,
      )
      expect(res.redirect).toHaveBeenCalledWith(URLs.PLAN_OVERVIEW)
      expect(next).not.toHaveBeenCalled()
      expect(req.services.auditService.send).toHaveBeenCalledWith(AuditEvent.UPDATE_AGREEMENT, {
        agreementStatus: expectedAgreementData.agreementStatus,
      })
    })

    it('should disagree plan and redirect if no validation errors', async () => {
      req.body = {
        'agree-plan-radio': 'no',
        'does-not-agree-details': 'test agreement detail note',
      }
      req.method = 'POST'
      const expectedAgreementData = {
        agreementStatus: PlanAgreementStatus.UPDATED_DO_NOT_AGREE,
        agreementStatusNote: 'test agreement detail note',
        optionalNote: '',
        personName: `${testHandoverContext.subject.givenName} ${testHandoverContext.subject.familyName}`,
        practitionerName: testHandoverContext.principal.displayName,
      }

      await runMiddlewareChain(controller.post, req, res, next)

      expect(req.services.planService.agreePlan).toHaveBeenCalledWith(
        couldNotAnswerTestPlan.uuid,
        expectedAgreementData,
      )
      expect(res.redirect).toHaveBeenCalledWith(URLs.PLAN_OVERVIEW)
      expect(next).not.toHaveBeenCalled()
      expect(req.services.auditService.send).toHaveBeenCalledWith(AuditEvent.UPDATE_AGREEMENT, {
        agreementStatus: expectedAgreementData.agreementStatus,
      })
    })

    it('should call next if errors', async () => {
      const error = new Error('fail')
      req.services.planService.agreePlan = jest.fn().mockRejectedValue(error)

      req.body = {
        'agree-plan-radio': 'yes',
      }
      req.method = 'POST'

      await runMiddlewareChain(controller.post, req, res, next)

      expect(req.services.planService.agreePlan).toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
      expect(req.services.auditService.send).not.toHaveBeenCalled()
    })
  })
})
