import ArnsApiClient from '../data/arnsApiClient'
import ArnsApiService from './arnsApiService'

jest.mock('../data/arnsApiClient')

describe('ArnsApiService', () => {
  let arnsApiService: ArnsApiService
  let mockArnsApiClient: jest.Mocked<ArnsApiClient>
  let mockRestClient: jest.Mocked<any>

  beforeEach(() => {
    mockRestClient = {
      get: jest.fn(),
    }

    mockArnsApiClient = new ArnsApiClient(null) as jest.Mocked<ArnsApiClient>
    mockArnsApiClient.restClient = jest.fn().mockResolvedValue(mockRestClient)

    arnsApiService = new ArnsApiService(mockArnsApiClient)
  })

  describe('getPlanByCrn', () => {
    it('should call restClient.get with correct path using crn', async () => {
      const crn = 'A1234B'

      await arnsApiService.getCriminogenicNeeds(crn)

      expect(mockArnsApiClient.restClient).toHaveBeenCalledWith('Getting Criminogenic Needs using crn')
      expect(mockRestClient.get).toHaveBeenCalledWith({ path: `/needs/${crn}` })
    })
  })
})
