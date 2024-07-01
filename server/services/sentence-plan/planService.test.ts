import { SentencePlanApiClient } from '../../data'
import PlanService from './planService'
import testPlan from '../../testutils/data/planData'

jest.mock('../../data/sentencePlanApiClient')

describe('PlanService', () => {
  let sentencePlanApiClientMock: jest.Mocked<SentencePlanApiClient>
  let planService: PlanService

  beforeEach(() => {
    sentencePlanApiClientMock = new SentencePlanApiClient(null) as jest.Mocked<SentencePlanApiClient>
    planService = new PlanService(sentencePlanApiClientMock)
  })

  describe('getPlanByUuid', () => {
    it('should call getPlanByUuid method of SentencePlanApiClient', async () => {
      const mockPlan = testPlan

      sentencePlanApiClientMock.getPlanByUuid.mockResolvedValue(mockPlan)

      const result = await planService.getPlanByUuid('some-uuid')
      expect(sentencePlanApiClientMock.getPlanByUuid).toHaveBeenCalledWith('some-uuid')
      expect(result).toBe(mockPlan)
    })
  })

  describe('getPlanByOasysAssessmentPk', () => {
    it('should call getPlanByOasysAssessmentPk method of SentencePlanApiClient', async () => {
      const mockPlan = testPlan

      sentencePlanApiClientMock.getPlanByOasysAssessmentPk.mockResolvedValue(mockPlan)

      const result = await planService.getPlanByOasysAssessmentPk('12345')
      expect(sentencePlanApiClientMock.getPlanByOasysAssessmentPk).toHaveBeenCalledWith('12345')
      expect(result).toBe(mockPlan)
    })
  })
})
