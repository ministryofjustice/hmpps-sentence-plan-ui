import HandoverApiClient from '../../data/handoverApiClient'
import HandoverContextService from './handoverContextService'
import testHandoverContext from '../../testutils/data/handoverData'

jest.mock('../../data/handoverApiClient')

describe('HandoverContextService', () => {
  let handoverApiClient: jest.Mocked<HandoverApiClient>
  let handoverContextService: HandoverContextService

  beforeEach(() => {
    handoverApiClient = new HandoverApiClient() as jest.Mocked<HandoverApiClient>
    handoverContextService = new HandoverContextService(handoverApiClient)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getContext', () => {
    it('should return context data when getContext is called', async () => {
      const mockHandoverToken = 'mock-token'

      handoverApiClient.getContextData.mockResolvedValue(testHandoverContext)

      const result = await handoverContextService.getContext(mockHandoverToken)

      expect(handoverApiClient.getContextData).toHaveBeenCalledWith(mockHandoverToken)
      expect(result).toEqual(testHandoverContext)
    })

    it('should throw an error if getContextData fails', async () => {
      const mockHandoverToken = 'mock-token'
      const mockError = new Error('Failed to fetch context data')

      handoverApiClient.getContextData.mockRejectedValue(mockError)

      await expect(handoverContextService.getContext(mockHandoverToken)).rejects.toThrow('Failed to fetch context data')
    })
  })
})
