import ArnsApiClient from '../../data/arnsApiClient'
import ArnsNeedsService from './arnsNeedsService'

jest.mock('../../data/arnsApiClient')

describe('ArnsNeedsService', () => {
  let arnsNeedsService: ArnsNeedsService
  let mockArnsApiClient: jest.Mocked<ArnsApiClient>
  let mockRestClient: jest.Mocked<any>

  beforeEach(() => {
    mockRestClient = {
      get: jest.fn(),
    }

    mockArnsApiClient = new ArnsApiClient(null) as jest.Mocked<ArnsApiClient>
    mockArnsApiClient.restClient = jest.fn().mockResolvedValue(mockRestClient)

    arnsNeedsService = new ArnsNeedsService(mockArnsApiClient)
  })

  describe('getPlanByCrn', () => {
    it('should call restClient.get with correct path using crn', async () => {
      const crn = 'A1234B'

      await arnsNeedsService.getCriminogenicNeeds(crn)

      expect(mockArnsApiClient.restClient).toHaveBeenCalledWith('Getting Criminogenic Needs using crn')
      expect(mockRestClient.get).toHaveBeenCalledWith({ path: `/needs/crn/${crn}` })
    })
  })
})
