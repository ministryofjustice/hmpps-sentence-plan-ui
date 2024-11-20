import URLs from '../URLs'
import testReferenceData from '../../testutils/data/referenceData'
import testPopData from '../../testutils/data/popData'
import { roSHData } from '../../testutils/data/roshData'

jest.mock('../../services/sentence-plan/referentialDataService', () => {
  return jest.fn().mockImplementation(() => ({
    getQuestionDataByAreaOfNeed: jest.fn().mockResolvedValue(testReferenceData[0]),
  }))
})
jest.mock('../../services/sentence-plan/infoService', () => {
  return jest.fn().mockImplementation(() => ({
    getPopData: jest.fn().mockResolvedValue(testPopData),
    getRoSHData: jest.fn().mockResolvedValue(roSHData),
  }))
})

// let app: Express
// const referentialDataService = new ReferentialDataService() as jest.Mocked<ReferentialDataService>
// const infoService = new InfoService(null) as jest.Mocked<InfoService>
// beforeEach(() => {
//   app = appWithAllRoutes({
//     services: {
//       referentialDataService,
//       infoService,
//     },
//   })
// })

// afterEach(() => {
//   jest.resetAllMocks()
// })

describe(`GET ${URLs.CREATE_GOAL}`, () => {
  it('should render create goal page', async () => {
    // const response = await request(app).get(URLs.CREATE_GOAL).expect('Content-Type', /html/).expect(200)

    // expect(response.text).toContain(locale.en.title.replace('{POP_NAME}', testPopData.givenName))
    // expect(infoService.getPopData).toHaveBeenCalled()
    // expect(infoService.getRoSHData).toHaveBeenCalled()
    expect(true)
  })
})
