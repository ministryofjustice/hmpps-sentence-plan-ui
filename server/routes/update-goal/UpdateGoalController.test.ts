import { NextFunction, Request, Response } from 'express'
import UpdateGoalController from './UpdateGoalController'
import mockReq from '../../testutils/preMadeMocks/mockReq'
import mockRes from '../../testutils/preMadeMocks/mockRes'
import { AreaOfNeed } from '../../testutils/data/referenceData'
import ReferentialDataService from '../../services/sentence-plan/referentialDataService'
import locale from './locale.json'
import handoverData from '../../testutils/data/handoverData'
import { testGoal } from '../../testutils/data/goalData'

jest.mock('../../services/sentence-plan/referentialDataService', () => {
  return jest.fn().mockImplementation(() => ({
    getSortedAreasOfNeed: jest.fn().mockReturnValue(AreaOfNeed),
  }))
})

jest.mock('../../services/sentence-plan/goalService', () => {
  return jest.fn().mockImplementation(() => ({
    getGoal: jest.fn().mockResolvedValue(testGoal),
  }))
})

jest.mock('../../services/sessionService', () => {
  return jest.fn().mockImplementation(() => ({
    getSubjectDetails: jest.fn().mockReturnValue(handoverData.subject),
  }))
})

describe('AddStepsController', () => {
  let controller: UpdateGoalController
  let mockReferentialDataService: jest.Mocked<ReferentialDataService>

  let req: Request
  let res: Response
  let next: NextFunction

  const viewData = {
    locale: locale.en,
    data: {
      goal: testGoal,
      popData: handoverData.subject,
      areaOfNeed: AreaOfNeed.find(x => x.name === testGoal.areaOfNeed.name),
      relatedAreasOfNeed: testGoal.relatedAreasOfNeed.map(x => x.name),
    },
    errors: {},
  }

  beforeEach(() => {
    mockReferentialDataService = new ReferentialDataService() as jest.Mocked<ReferentialDataService>
    req = mockReq({
      params: { uuid: testGoal.uuid },
    })
    res = mockRes()
    next = jest.fn()

    controller = new UpdateGoalController(mockReferentialDataService)
  })

  describe('get', () => {
    it('should render without validation errors', async () => {
      await controller.get(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/update-goal', viewData)
    })
  })

  describe('post', () => {})
})
