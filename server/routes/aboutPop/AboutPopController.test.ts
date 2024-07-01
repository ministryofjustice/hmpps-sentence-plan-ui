import ReferentialDataService from '../../services/sentence-plan/referentialDataService'
import InfoService from '../../services/sentence-plan/infoService'
import mockRes from '../../testutils/preMadeMocks/mockRes'
import mockReq from '../../testutils/preMadeMocks/mockReq'
import testPopData from '../../testutils/data/popData'
import testReferenceData from '../../testutils/data/referenceData'
import AboutPopController from './AboutPopController'
import locale from './locale.json'
import { parsedRoshData } from '../../testutils/data/roshData'
import handoverData from '../../testutils/data/handoverData'

jest.mock('../../services/sentence-plan/referentialDataService', () => {
  return jest.fn().mockImplementation(() => ({
    getAreasOfNeedQuestionData: jest.fn().mockResolvedValue([
      {
        id: testReferenceData.AreasOfNeed[0].id,
        Name: testReferenceData.AreasOfNeed[0].Name,
        active: testReferenceData.AreasOfNeed[0].active,
      },
    ]),
  }))
})
jest.mock('../../services/sentence-plan/infoService', () => {
  return jest.fn().mockImplementation(() => ({
    getPopData: jest.fn().mockResolvedValue(testPopData),
    getRoSHData: jest.fn().mockResolvedValue(parsedRoshData),
  }))
})
jest.mock('../../services/sessionService', () => {
  return jest.fn().mockImplementation(() => ({
    getSubjectDetails: jest.fn().mockReturnValue(handoverData.subject),
  }))
})

describe('AboutPopController', () => {
  let controller: AboutPopController
  let mockReferentialDataService: jest.Mocked<ReferentialDataService>
  let mockInfoService: jest.Mocked<InfoService>
  beforeEach(() => {
    mockReferentialDataService = new ReferentialDataService(null) as jest.Mocked<ReferentialDataService>
    mockInfoService = new InfoService(null) as jest.Mocked<InfoService>

    controller = new AboutPopController(mockReferentialDataService, mockInfoService)
  })

  describe('get', () => {
    it('should render when no exceptions thrown', async () => {
      const req = mockReq()
      const res = mockRes()
      const next = jest.fn()

      await controller.get(req, res, next)
      const { id, Name, active } = testReferenceData.AreasOfNeed[0]
      const payload = {
        locale: locale.en,
        data: {
          roshData: parsedRoshData,
          popData: testPopData,
          referenceData: [
            {
              id,
              Name,
              active,
              url: Name.replace(/ /g, '-').toLowerCase(),
            },
          ],
        },
        errors: {},
      }
      expect(res.render).toHaveBeenCalledWith('pages/about-pop', payload)
    })

    it('should forward to error handler if an exception occurs', async () => {
      const req = mockReq()
      const res = mockRes()
      const next = jest.fn()
      const testError = new Error('test error')
      mockReferentialDataService.getAreasOfNeedQuestionData.mockRejectedValue(testError)

      await controller.get(req, res, next)

      expect(res.render).not.toHaveBeenCalledWith('pages/about-pop', expect.anything())
      expect(next).toHaveBeenCalledWith(testError)
    })
  })
})
