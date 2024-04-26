import nock from 'nock'
import config from '../config'
import SentencePlanApiClient from './sentencePlanApiClient'
import testReferenceData from '../testutils/data/referenceData'
import { testGoal, testNewGoal } from '../testutils/data/goalData'
import { testNewStep, testStep } from '../testutils/data/stepData'

describe('SentencePlanApiClient', () => {
  let client: SentencePlanApiClient
  let fakeApi: nock.Scope

  beforeEach(() => {
    client = new SentencePlanApiClient()
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
      const parentGoalId = testGoal.uuid
      fakeApi.post(`/goals/${parentGoalId}/steps`, [testNewStep]).reply(200, testStep)

      const result = await client.saveSteps([testNewStep], parentGoalId)

      expect(result).toEqual(testStep)
    })
  })
})
