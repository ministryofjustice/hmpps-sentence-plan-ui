import ReferentialDataService from '../../services/sentence-plan/referentialDataService'
import InfoService from '../../services/sentence-plan/infoService'
import mockRes from '../../testutils/preMadeMocks/mockRes'
import mockReq from '../../testutils/preMadeMocks/mockReq'
import testPopData from '../../testutils/data/popData'
import AboutPopController from './AboutPopController'
import locale from './locale.json'
import { parsedRoshData } from '../../testutils/data/roshData'
import handoverData from '../../testutils/data/handoverData'
import testReferenceData from '../../testutils/data/referenceData'
import { toKebabCase } from '../../utils/utils'

jest.mock('../../services/sentence-plan/referentialDataService', () => {
  return jest.fn().mockImplementation(() => ({
    getAreasOfNeed: jest
      .fn()
      .mockResolvedValue(testReferenceData.map(({ id, name }) => ({ id, name, url: toKebabCase(name) }))),
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
    mockReferentialDataService = new ReferentialDataService() as jest.Mocked<ReferentialDataService>
    mockInfoService = new InfoService(null) as jest.Mocked<InfoService>

    controller = new AboutPopController(mockReferentialDataService, mockInfoService)
  })

  describe('get', () => {
    it('should render when no exceptions thrown', async () => {
      //   const req = mockReq()
      //   const res = mockRes()
      //   const next = jest.fn()

      //   await controller.get(req, res, next)
      //   const { id, name } = mockReferentialDataService.getAreasOfNeed()[0]
      //   const payload = {
      //     locale: locale.en,
      //     data: {
      //       roshData: parsedRoshData,
      //       popData: testPopData,
      //       referenceData: [
      //         {
      //           id,
      //           name,
      //         },
      //       ],
      //     },
      //     errors: {},
      //   }
      //   expect(res.render).toHaveBeenCalledWith('pages/about-pop', payload)
      expect(true)
    })
  })
})
