import { NextFunction, Request, Response } from 'express'
import handoverData from '../../testutils/data/handoverData'
import AgreePlanController from './AgreePlanController'
import PlanService from '../../services/sentence-plan/planService'
import mockReq from '../../testutils/preMadeMocks/mockReq'
import mockRes from '../../testutils/preMadeMocks/mockRes'
import locale from './locale.json'

jest.mock('../../services/sessionService', () => {
  return jest.fn().mockImplementation(() => ({
    getSubjectDetails: jest.fn().mockReturnValue(handoverData.subject),
    getPlanUUID: jest.fn().mockReturnValue('9506fba0-d2c7-4978-b3fc-aefd86821844'),
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

    it('should render with validation errors', async () => {})
  })

  describe('post', () => {
    describe('validation', () => {})
  })

  it('should save and redirect when there are no validation errors', async () => {})

  it('should render the form again if there are validation errors', async () => {})

  it('should should return error page if there is an error saving the goal', async () => {})
})
