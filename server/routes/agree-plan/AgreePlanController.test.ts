import { NextFunction, Request, Response } from 'express'
import { plainToInstance } from 'class-transformer'
import testPlan from '../../testutils/data/planData'
import AgreePlanController from './AgreePlanController'
import PlanService from '../../services/sentence-plan/planService'
import mockReq from '../../testutils/preMadeMocks/mockReq'
import mockRes from '../../testutils/preMadeMocks/mockRes'
import { getValidationErrors } from '../../middleware/validationMiddleware'
import locale from './locale.json'
import AgreePlanPostModel from './models/AgreePlanPostModel'
import runMiddlewareChain from '../../testutils/runMiddlewareChain'

jest.mock('../../services/sessionService', () => {
  return jest.fn().mockImplementation(() => ({
    getPlanUUID: jest.fn().mockReturnValue('9506fba0-d2c7-4978-b3fc-aefd86821844'),
  }))
})

jest.mock('../../services/sentence-plan/planService', () => {
  return jest.fn().mockImplementation(() => ({
    agreePlan: jest.fn().mockResolvedValue(testPlan),
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
      planUuid: '9506fba0-d2c7-4978-b3fc-aefd86821844',
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
    it('should render without validation errors', async () => {
      await controller.get(req, res, next)
      expect(res.render).toHaveBeenCalledWith('pages/agree-plan', viewData)
    })

    it('should render with validation errors', async () => {
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

      await controller.get(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/agree-plan', expectedViewData)
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

    describe('save and redirect', () => {
      it('should save and redirect when there are no validation errors', async () => {
        // TODO
      })

      it('should should return error page if there is an error saving the goal', async () => {
        // TODO
      })
    })
  })
})
