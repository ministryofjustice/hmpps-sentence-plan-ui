import { NextFunction, Request, Response } from 'express'
import mockReq from '../../testutils/preMadeMocks/mockReq'
import mockRes from '../../testutils/preMadeMocks/mockRes'
import locale from './locale.json'
import testPlan from '../../testutils/data/planData'
import testNoteData from '../../testutils/data/noteData'
import PlanHistoryController from './PlanHistoryController'

const oasysReturnUrl = 'https://oasys.return.url'

jest.mock('../../services/sessionService', () => {
  return jest.fn().mockImplementation(() => ({
    getPlanUUID: jest.fn().mockReturnValue(testPlan.uuid),
    getOasysReturnUrl: jest.fn().mockReturnValue(oasysReturnUrl),
  }))
})

jest.mock('../../services/sentence-plan/planService', () => {
  return jest.fn().mockImplementation(() => ({
    getNotes: jest.fn().mockReturnValue([]),
  }))
})

describe('PlanHistoryController', () => {
  let controller: PlanHistoryController

  let req: Request
  let res: Response
  let next: NextFunction
  let viewData: any

  beforeEach(() => {
    viewData = {
      locale: locale.en,
      data: {
        notes: [],
        oasysReturnUrl,
      },
      errors: {},
    }

    req = mockReq()
    res = mockRes()
    next = jest.fn()

    controller = new PlanHistoryController()
  })

  describe('get', () => {
    it('should render without validation errors and no notes', async () => {
      await controller.get(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/plan-history', viewData)
    })

    // render without errors and plan agreement note
    it('should render without validation errors and a a plan agreement note', async () => {
      // change the mock functionality to return a test note
      req.services.planService.getNotes = jest.fn().mockReturnValue([testNoteData])

      // change the viewData to include the test note
      viewData.data.notes = [testNoteData]

      await controller.get(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/plan-history', viewData)
    })
  })
})
