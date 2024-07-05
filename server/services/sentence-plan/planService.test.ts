import { SentencePlanApiClient } from '../../data'
import PlanService from './planService'

jest.mock('../../data/sentencePlanApiClient')

describe('PlanService', () => {
  let planService: PlanService
  let mockSentencePlanApiClient: jest.Mocked<SentencePlanApiClient>
  let mockRestClient: jest.Mocked<any>

  beforeEach(() => {
    mockRestClient = {
      get: jest.fn(),
    }

    mockSentencePlanApiClient = new SentencePlanApiClient(null) as jest.Mocked<SentencePlanApiClient>
    mockSentencePlanApiClient.restClient = jest.fn().mockResolvedValue(mockRestClient)

    planService = new PlanService(mockSentencePlanApiClient)
  })

  describe('getPlanByUuid', () => {
    it('should call restClient.get with correct path', async () => {
      const planUuid = '123-456-789'
      const expectedPath = `/plans/${planUuid}`

      await planService.getPlanByUuid(planUuid)

      expect(mockSentencePlanApiClient.restClient).toHaveBeenCalledWith(`Getting plan with plan UUID: ${planUuid}`)
      expect(mockRestClient.get).toHaveBeenCalledWith({ path: expectedPath })
    })
  })

  describe('getPlanByOasysAssessmentPk', () => {
    it('should call restClient.get with correct path', async () => {
      const oasysAssessmentPk = '987654'
      const expectedPath = `/oasys/plans/${oasysAssessmentPk}`

      await planService.getPlanByOasysAssessmentPk(oasysAssessmentPk)

      expect(mockSentencePlanApiClient.restClient).toHaveBeenCalledWith(
        `Getting plan with OASys Assessment PK: ${oasysAssessmentPk}`,
      )
      expect(mockRestClient.get).toHaveBeenCalledWith({ path: expectedPath })
    })
  })
})
