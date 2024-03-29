import type { Express } from 'express'
import request from 'supertest'
import { formatISO } from 'date-fns'
import { appWithAllRoutes, mockServices } from './testutils/appSetup'

let app: Express
const services = mockServices()

beforeEach(() => {
  app = appWithAllRoutes({ services })
})

afterEach(() => {
  jest.resetAllMocks()
})

beforeEach(() => {
  services.deliusService.getCaseDetails = jest.fn().mockResolvedValue({
    crn: '123',
    name: 'Test Case',
    dateOfBirth: '1990-01-01',
    managerName: 'Test',
    tier: 'T1',
    isCustody: false,
  })
  services.deliusService.getInitialAppointment = jest.fn().mockResolvedValue({
    appointmentDate: '1990-01-01',
  })
  services.sentencePlanClient.listObjectives = jest.fn().mockResolvedValue({
    objectives: [],
  })
  services.prisonApiClient.getArrivalIntoCustodyDate = jest.fn().mockResolvedValue({
    sentenceDetail: {
      sentenceStartDate: '2010-02-03',
    },
  })
})

describe('GET /case', () => {
  beforeEach(() => {
    services.sentencePlanClient.listSentencePlans = jest.fn().mockResolvedValue({ sentencePlans: [] })
  })

  it('should render case details banner', () => {
    return request(app)
      .get('/case/123')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Test Case')
        expect(res.text).toContain('T1')
      })
  })

  it('should display a message when there are no sentence plans', () => {
    return request(app)
      .get('/case/123')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Test Case does not have a sentence plan yet.')
        expect(res.text).toContain('Create a sentence plan')
      })
  })

  it('should display existing sentence plans', () => {
    services.sentencePlanClient.listSentencePlans = jest.fn().mockResolvedValue({
      sentencePlans: [
        {
          id: '123',
          crn: '123',
          status: 'Draft',
          createdDate: '2023-05-01',
        },
      ],
    })
    return request(app)
      .get('/case/123')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Draft')
        expect(res.text).toContain('2023-05-01')
      })
  })
})

it('should display active sentence plan with no delete button', () => {
  services.sentencePlanClient.listSentencePlans = jest.fn().mockResolvedValue({
    sentencePlans: [
      {
        id: '123',
        crn: '123',
        status: 'Active',
        createdDate: '2023-05-01',
      },
    ],
  })
  return request(app)
    .get('/case/123')
    .expect('Content-Type', /html/)
    .expect(res => {
      expect(res.text).toContain('Active')
      expect(res.text).toContain('2023-05-01')
      expect(res.text).not.toContain('Delete')
    })
})

describe('GET /sentence-plan', () => {
  it('should show no completed sections initially', () => {
    services.sentencePlanClient.getSentencePlan = jest.fn().mockResolvedValue({ crn: '123' })
    return request(app)
      .get('/sentence-plan/123/summary')
      .expect('Content-Type', /html/)
      .expect(res => expect(res.text).not.toContain('Completed'))
  })

  it('should tag completed sections', () => {
    services.sentencePlanClient.getSentencePlan = jest.fn().mockResolvedValue({
      crn: '123',
      riskFactors: 'Dummy data',
      protectiveFactors: 'More dummy data',
    })
    return request(app)
      .get('/sentence-plan/123/summary')
      .expect('Content-Type', /html/)
      .expect(res => expect(res.text).toContain('completed'))
  })

  it('should list objectives', () => {
    services.sentencePlanClient.getSentencePlan = jest.fn().mockResolvedValue({ crn: '123' })
    services.sentencePlanClient.listObjectives = jest.fn().mockResolvedValue({
      objectives: [{ description: 'Existing objective' }],
    })
    return request(app)
      .get('/sentence-plan/123/summary')
      .expect('Content-Type', /html/)
      .expect(res => expect(res.text).toContain('Existing objective'))
  })
})

describe('GET /sentence-plan/engagement-and-compliance', () => {
  beforeEach(() => {
    services.sentencePlanClient.getSentencePlan = jest.fn().mockResolvedValue({
      id: '123',
      riskFactors: 'Existing text',
    })
  })

  it('should display existing data', () => {
    return request(app)
      .get('/sentence-plan/123/engagement-and-compliance')
      .expect('Content-Type', /html/)
      .expect(res => expect(res.text).toContain('Existing text'))
  })

  it('should save data', () => {
    const updateApi = jest.fn().mockResolvedValue({})
    services.sentencePlanClient.updateSentencePlan = updateApi
    return request(app)
      .post('/sentence-plan/123/engagement-and-compliance')
      .send({ 'risk-factors': 'Risk factors', 'protective-factors': 'protective factors' })
      .expect(302)
      .expect('Location', '/sentence-plan/123/summary')
      .expect(_ =>
        expect(updateApi).toBeCalledWith({
          id: '123',
          riskFactors: 'Risk factors',
          protectiveFactors: 'protective factors',
        }),
      )
  })

  it('can delete a sentence plan', () => {
    services.sentencePlanClient.getSentencePlan = jest.fn().mockResolvedValue({ crn: '123' })
    const api = jest.fn().mockResolvedValue({})
    services.sentencePlanClient.deleteSentencePlan = api
    return request(app)
      .post('/sentence-plan/1/delete')
      .expect(302)
      .expect('Location', '/case/123')
      .expect(_ => expect(api).toBeCalledWith('1'))
  })

  it('should start sentence plan', () => {
    const startDate = formatISO(new Date())

    services.sentencePlanClient.getSentencePlan = jest.fn().mockResolvedValue({
      id: '123',
      crn: '123',
      status: 'Draft',
      createdDate: '2023-05-01',
    })

    const updateApi = jest.fn().mockResolvedValue({})
    services.sentencePlanClient.updateSentencePlan = updateApi
    return request(app)
      .post('/sentence-plan/123/start')
      .send({ activeDate: startDate })
      .expect(302)
      .expect('Location', '/case/123')
      .expect(_ =>
        expect(updateApi).toBeCalledWith({
          id: '123',
          crn: '123',
          status: 'Draft',
          createdDate: '2023-05-01',
          activeDate: startDate,
        }),
      )
  })
})
