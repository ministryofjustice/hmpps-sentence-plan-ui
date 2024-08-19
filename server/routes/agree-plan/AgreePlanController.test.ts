import { NextFunction, Request, Response } from 'express'
import handoverData from '../../testutils/data/handoverData'
import testPlan from '../../testutils/data/planData'
import AgreePlanController from './AgreePlanController'
import PlanService from '../../services/sentence-plan/planService'
import mockReq from '../../testutils/preMadeMocks/mockReq'
import mockRes from '../../testutils/preMadeMocks/mockRes'
import validate from '../../middleware/validationMiddleware'
import locale from './locale.json'
import AgreePlanPostModel from './models/AgreePlanPostModel'

jest.mock('../../services/sessionService', () => {
  return jest.fn().mockImplementation(() => ({
    getSubjectDetails: jest.fn().mockReturnValue(handoverData.subject),
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
      popData: handoverData.subject,
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

        await controller.post(req as Request, res as Response, next)

        expect(res.render).toHaveBeenCalledWith('pages/agree-plan', expectedViewData)
        expect(mockPlanService.agreePlan).not.toHaveBeenCalled()
        expect(res.redirect).not.toHaveBeenCalled()
        expect(next).not.toHaveBeenCalled()
      })

      describe('agree-plan-radio', () => {
        it('should add error if not selected', async () => {
          validate({ body: AgreePlanPostModel })(req, null, jest.fn)

          expect(req.errors.body).toMatchObject({
            'agree-plan-radio': { isNotEmpty: true },
          })
        })

        it('should add error if no is selected and details are missing', async () => {
          req.body['agree-plan-radio'] = 'no'

          validate({ body: AgreePlanPostModel })(req, null, jest.fn)

          expect(req.errors.body).toMatchObject({
            'does-not-agree-details': { isNotEmpty: true },
          })
        })

        it('should add error if could-not-answer is selected and details are missing', async () => {
          req.body['agree-plan-radio'] = 'couldNotAnswer'

          validate({ body: AgreePlanPostModel })(req, null, jest.fn)

          expect(req.errors.body).toMatchObject({
            'could-not-answer-details': { isNotEmpty: true },
          })
        })
      })
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
