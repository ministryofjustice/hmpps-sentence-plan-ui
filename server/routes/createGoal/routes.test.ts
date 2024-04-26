import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes } from '../testutils/appSetup'
import locale from './locale.json'
import URLs from '../URLs'
import testReferenceData from '../../testutils/data/referenceData'
import testPopData from '../../testutils/data/popData'
import testNoteData from '../../testutils/data/noteData'
import ReferentialDataService from '../../services/sentence-plan/referentialDataService'
import InfoService from '../../services/sentence-plan/infoService'
import NoteService from '../../services/sentence-plan/noteService'

jest.mock('../../services/sentence-plan/referentialDataService', () => {
  return jest.fn().mockImplementation(() => ({
    getQuestionDataByAreaOfNeed: jest.fn().mockResolvedValue(testReferenceData.AreasOfNeed[0]),
  }))
})
jest.mock('../../services/sentence-plan/infoService', () => {
  return jest.fn().mockImplementation(() => ({
    getPopData: jest.fn().mockResolvedValue(testPopData),
  }))
})
jest.mock('../../services/sentence-plan/noteService', () => {
  return jest.fn().mockImplementation(() => ({
    getNoteDataByAreaOfNeed: jest.fn().mockResolvedValue(testNoteData),
  }))
})

let app: Express
const referentialDataService = new ReferentialDataService(null) as jest.Mocked<ReferentialDataService>
const infoService = new InfoService(null) as jest.Mocked<InfoService>
const noteService = new NoteService(null) as jest.Mocked<NoteService>

beforeEach(() => {
  app = appWithAllRoutes({
    services: {
      referentialDataService,
      infoService,
      noteService,
    },
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe(`GET ${URLs.CREATE_GOAL}`, () => {
  it('should render create goal page', () => {
    return request(app)
      .get(URLs.CREATE_GOAL)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain(locale.en.title.replace('{POP_NAME}', testPopData.firstName))
      })
  })
})
