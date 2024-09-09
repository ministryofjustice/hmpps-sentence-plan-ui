import SentencePlanApiClient from './sentencePlanApiClient'
import HmppsAuthClient from './hmppsAuthClient'
import RestClient from './restClient'
import config from '../config'
import logger from '../../logger'

jest.mock('./hmppsAuthClient')
jest.mock('./restClient')
jest.mock('../config', () => ({
  apis: {
    sentencePlanApi: {
      url: 'http://localhost:8080',
    },
    hmppsAuth: {
      url: 'http://localhost:9090/auth',
      timeout: {
        response: 10000,
        deadline: 10000,
      },
    },
  },
  redis: {
    tls_enabled: false,
  },
}))
jest.mock('../../logger', () => ({
  info: jest.fn(),
}))

describe('SentencePlanApiClient', () => {
  let sentencePlanApiClient: SentencePlanApiClient
  let mockHmppsAuthClient: jest.Mocked<HmppsAuthClient>

  beforeEach(() => {
    mockHmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
    mockHmppsAuthClient.getSystemClientToken = jest.fn().mockResolvedValue({ username: 'Bob', accessToken: 'mock-token' })
    sentencePlanApiClient = new SentencePlanApiClient(mockHmppsAuthClient)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('restClient', () => {
    it('should create a RestClient with system token when no token is provided', async () => {
      const result = await sentencePlanApiClient.restClient()

      expect(mockHmppsAuthClient.getSystemClientToken).toHaveBeenCalled()
      expect(RestClient).toHaveBeenCalledWith('Sentence Plan Api Client', config.apis.sentencePlanApi, 'mock-token')
      expect(result).toBeInstanceOf(RestClient)
    })

    it('should log info message when provided', async () => {
      const infoMessage = 'Test info message'
      await sentencePlanApiClient.restClient(infoMessage)

      expect(logger.info).toHaveBeenCalledWith(infoMessage)
    })
  })
})
