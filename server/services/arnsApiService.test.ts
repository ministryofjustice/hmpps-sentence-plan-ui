import ArnsApiClient from '../data/arnsApiClient'
import ArnsApiService from './arnsApiService'
import { CriminogenicNeeds, CriminogenicNeedScore, Section } from '../@types/CriminogenicNeedsType'

jest.mock('../data/arnsApiClient')

describe('ArnsApiService', () => {
  let arnsApiService: ArnsApiService
  let mockArnsApiClient: jest.Mocked<ArnsApiClient>
  let mockRestClient: jest.Mocked<any>

  const response: CriminogenicNeeds = {
    identifiedNeeds: [
      {
        section: Section.ACCOMMODATION,
        name: 'Accommodation',
        score: 1,
      },
    ],
    notIdentifiedNeeds: [
      {
        section: Section.DRUG_MISUSE,
        name: 'Drug misuse',
        score: 2,
      },
    ],
    unansweredNeeds: [
      {
        section: Section.ALCOHOL_MISUSE,
        name: 'Alcohol misuse',
        score: null,
      },
    ],
    assessedOn: 'now',
  }

  beforeEach(() => {
    mockRestClient = {
      get: jest.fn().mockResolvedValue(response),
    }

    mockArnsApiClient = new ArnsApiClient(null) as jest.Mocked<ArnsApiClient>
    mockArnsApiClient.restClient = jest.fn().mockResolvedValue(mockRestClient)

    arnsApiService = new ArnsApiService(mockArnsApiClient)
  })

  describe('getPlanByCrn', () => {
    it('should call restClient.get with correct path using crn', async () => {
      const crn = 'A1234B'

      const result = await arnsApiService.getCriminogenicNeeds(crn)
      const expectedResult: CriminogenicNeedScore[] = [
        {
          section: Section.ACCOMMODATION,
          score: 1,
        },
        {
          section: Section.DRUG_MISUSE,
          score: 2,
        },
        {
          section: Section.ALCOHOL_MISUSE,
          score: null,
        },
      ]

      expect(result).toEqual(expectedResult)
      expect(mockArnsApiClient.restClient).toHaveBeenCalledWith('Getting Criminogenic Needs using crn')
      expect(mockRestClient.get).toHaveBeenCalledWith({ path: `/needs/${crn}?excludeIncomplete=false` })
    })
  })
})
