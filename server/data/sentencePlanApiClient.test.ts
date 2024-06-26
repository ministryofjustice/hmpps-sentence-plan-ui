import nock from 'nock'
import config from '../config'
import SentencePlanApiClient from './sentencePlanApiClient'
import testReferenceData from '../testutils/data/referenceData'
import { testGoal, testNewGoal } from '../testutils/data/goalData'
import { testNewStep, testStep } from '../testutils/data/stepData'
import HmppsAuthClient from './hmppsAuthClient'

jest.mock('./hmppsAuthClient', () => {
  return jest.fn().mockImplementation(() => ({
    getSystemClientToken: jest.fn().mockResolvedValue('a-mock-token'),
  }))
})

describe('SentencePlanApiClient', () => {
  let client: SentencePlanApiClient
  let fakeApi: nock.Scope
  const hmppsAuthClient: HmppsAuthClient = new HmppsAuthClient(null)

  beforeEach(() => {
    client = new SentencePlanApiClient(hmppsAuthClient)
    fakeApi = nock(config.apis.sentencePlanApi.url)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('getAllReferenceData', () => {
    it('should fetch all reference data from the API', async () => {
      fakeApi.get(`/question-reference-data`).reply(200, testReferenceData)

      const result = await client.getAllReferenceData()

      expect(result).toEqual(testReferenceData)
    })
  })

  describe('saveGoal', () => {
    it('should save goal data via the API', async () => {
      fakeApi.post(`/goals`, testNewGoal).reply(200, testGoal)

      const result = await client.saveGoal(testNewGoal)

      expect(result).toEqual(testGoal)
    })
  })

  describe('saveSteps', () => {
    it('should save steps data via the API', async () => {
      const parentGoalUuid = testGoal.uuid
      fakeApi.post(`/goals/${parentGoalUuid}/steps`, [testNewStep]).reply(200, testStep)

      const result = await client.saveSteps([testNewStep], parentGoalUuid)

      expect(result).toEqual(testStep)
    })
  })
})
