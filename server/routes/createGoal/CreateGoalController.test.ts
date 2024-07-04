import { Request } from 'express'
import CreateGoalController from './CreateGoalController'
import ReferentialDataService from '../../services/sentence-plan/referentialDataService'
import InfoService from '../../services/sentence-plan/infoService'
import NoteService from '../../services/sentence-plan/noteService'
import validate from '../../middleware/validationMiddleware'
import CreateGoalPostModel from './models/CreateGoalPostModel'
import mockRes from '../../testutils/preMadeMocks/mockRes'
import mockReq from '../../testutils/preMadeMocks/mockReq'
import testPopData from '../../testutils/data/popData'
import testNoteData from '../../testutils/data/noteData'
import testReferenceData from '../../testutils/data/referenceData'
import { FORMS } from '../../services/formStorageService'
import URLs from '../URLs'
import locale from './locale.json'
import GoalService from '../../services/sentence-plan/goalService'

jest.mock('../../services/sentence-plan/referentialDataService', () => {
  return jest.fn().mockImplementation(() => ({
    getQuestionDataByAreaOfNeed: jest.fn().mockResolvedValue(testReferenceData[0]),
    getReferenceData: jest.fn().mockResolvedValue(testReferenceData),
    getGoals: jest.fn().mockReturnValue(testReferenceData[0].goals[0]),
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

describe('CreateGoalController', () => {
  let controller: CreateGoalController
  let mockReferentialDataService: jest.Mocked<ReferentialDataService>
  let mockInfoService: jest.Mocked<InfoService>
  let mockNoteService: jest.Mocked<NoteService>
  let mockGoalService: jest.Mocked<GoalService>

  beforeEach(() => {
    mockReferentialDataService = new ReferentialDataService() as jest.Mocked<ReferentialDataService>
    mockInfoService = new InfoService(null) as jest.Mocked<InfoService>
    mockNoteService = new NoteService(null) as jest.Mocked<NoteService>
    mockGoalService = new GoalService(null) as jest.Mocked<GoalService>

    controller = new CreateGoalController(mockReferentialDataService, mockInfoService, mockNoteService, mockGoalService)
  })

  describe('post', () => {
    describe('validation', () => {
      let req: Request

      beforeEach(() => {
        req = { body: {} } as Request
      })

      describe('goal-selection', () => {
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + 1)
        const dateSelection = {
          'date-selection-radio': futureDate,
        }

        it('should add error if "goal-selection-radio" is not provided', () => {
          req.body = {
            ...dateSelection,
          }
          validate({ body: CreateGoalPostModel })(req, null, jest.fn)
          expect(req.errors).toEqual({
            body: { 'goal-selection-radio': { isNotEmpty: true } },
          })
        })

        it('should add error if "goal-selection-custom" is not provided when "goal-selection-radio" is "custom"', () => {
          req.body = {
            ...dateSelection,
            'goal-selection-radio': 'custom',
          }
          validate({ body: CreateGoalPostModel })(req, null, jest.fn)
          expect(req.errors).toEqual({
            body: {
              'goal-selection-custom': { isNotEmpty: true },
            },
          })
        })

        it('should not add error for "goal-selection-custom" if "goal-selection-radio" is not "custom"', () => {
          req.body = {
            ...dateSelection,
            'goal-selection-radio': 'standard',
          }
          validate({ body: CreateGoalPostModel })(req, null, jest.fn)
          expect(req.errors).not.toHaveProperty('body.goal-selection-custom')
        })

        it('should not add error for "goal-selection-custom" is provided', () => {
          req.body = {
            ...dateSelection,
            'goal-selection-radio': 'custom',
            'goal-selection-custom': 'A custom goal',
          }
          validate({ body: CreateGoalPostModel })(req, null, jest.fn)
          expect(req.errors.body).not.toHaveProperty('goal-selection-custom')
        })
      })

      describe('date-selection', () => {
        const goalSelection = {
          'goal-selection-radio': 'A selectable goal',
        }

        it('should add error if "date-selection-radio" is not provided', () => {
          req.body = {
            ...goalSelection,
          }
          validate({ body: CreateGoalPostModel })(req, null, jest.fn())
          expect(req.errors).toEqual({
            body: { 'date-selection-radio': { isNotEmpty: true } },
          })
        })

        it('should add error if "date-selection-custom" is not provided when "date-selection-radio" is "custom"', () => {
          req.body = {
            ...goalSelection,
            'date-selection-radio': 'custom',
          }
          validate({ body: CreateGoalPostModel })(req, null, jest.fn())
          expect(req.errors).toEqual({
            body: {
              'date-selection-custom': { isDate: true, minDate: true },
            },
          })
        })

        it('should not add error for "date-selection-custom" if "date-selection-radio" is not "custom"', () => {
          req.body = {
            ...goalSelection,
            'date-selection-radio': 'standard',
          }
          validate({ body: CreateGoalPostModel })(req, null, jest.fn())
          expect(req.errors).not.toHaveProperty('body.date-selection-custom')
        })

        it('should not add error if "date-selection-custom" is a valid future date when "date-selection-radio" is "custom"', () => {
          const futureDate = new Date()
          futureDate.setDate(futureDate.getDate() + 1)
          req.body = {
            ...goalSelection,
            'date-selection-radio': 'custom',
            'date-selection-custom-year': futureDate.getFullYear(),
            'date-selection-custom-month': futureDate.getMonth() + 1,
            'date-selection-custom-day': futureDate.getDate(),
          }
          validate({ body: CreateGoalPostModel })(req, null, jest.fn())
          expect(req.errors.body).not.toHaveProperty('date-selection-custom')
        })

        it('should add error if "date-selection-custom" is not a valid future date when "date-selection-radio" is "custom"', () => {
          const pastDate = new Date()
          pastDate.setDate(pastDate.getDate() - 1) // Setting a past date
          req.body = {
            ...goalSelection,
            'date-selection-radio': 'custom',
            'date-selection-custom-year': pastDate.getFullYear(),
            'date-selection-custom-month': pastDate.getMonth() + 1,
            'date-selection-custom-day': pastDate.getDate(),
          }
          validate({ body: CreateGoalPostModel })(req, null, jest.fn())
          expect(req.errors).toEqual({
            body: {
              'date-selection-custom': { minDate: true },
            },
          })
        })
      })

      it('should add no errors if valid data is provided', () => {
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + 1)
        req.body = {
          'goal-selection-radio': 'custom',
          'goal-selection-custom': 'A custom goal',
          'date-selection-radio': 'custom',
          'date-selection-custom-year': futureDate.getFullYear(),
          'date-selection-custom-month': futureDate.getMonth() + 1,
          'date-selection-custom-day': futureDate.getDate(),
        }
        validate({ body: CreateGoalPostModel })(req, null, jest.fn())
        expect(req.errors).toEqual({ body: {} })
      })
    })

    describe('when there is a validation error in the provided POST data', () => {
      const params = { areaOfNeed: 'an-area-of-need' }
      const body = {
        'goal-selection-radio': 'This is a pre-defined goal',
      }
      const errors = {
        body: { 'date-selection-radio': { isNotEmpty: true } },
        params: {},
        query: {},
      }

      it('should render with validation errors', async () => {
        const req = mockReq({ body, params, errors })
        const res = mockRes()
        const next = jest.fn()

        await controller.post(req, res, next)

        expect(res.render).toHaveBeenCalledWith('pages/create-goal', {
          locale: locale.en,
          data: {
            popData: testPopData,
            noteData: testNoteData,
            dateOptionsDate: expect.anything(),
            referenceData: testReferenceData[0],
            form: req.body,
          },
          errors,
        })
      })

      it('should forward to error handler if an exception occurs', async () => {
        const req = mockReq({ body, params, errors })
        const res = mockRes()
        const next = jest.fn()
        const testError = new Error('test error')

        mockReferentialDataService.getGoals.mockRejectedValue(testError)

        await controller.post(req, res, next)

        expect(res.render).not.toHaveBeenCalledWith('pages/create-goal', expect.anything())
        expect(next).toHaveBeenCalledWith(testError)
      })
    })

    describe('when there is no error in the provided POST data', () => {
      it('should call saveFormData correctly for CREATE_GOAL and CREATE_STEPS', async () => {
        const req = mockReq({ errors: { body: {} } })
        const res = mockRes()

        await controller.post(req, res, jest.fn)

        expect(req.services.formStorageService.saveFormData).toHaveBeenCalledWith(FORMS.CREATE_GOAL, {
          processed: expect.anything(),
          raw: req.body,
        })

        expect(req.services.formStorageService.saveFormData).toHaveBeenCalledWith(FORMS.CREATE_STEPS, {
          processed: [
            { description: 'Make a referral to housing officer', actor: 'Probation practitioner', status: 'PENDING' },
            { description: 'Provide any information that is required', actor: 'Joan', status: 'PENDING' },
          ],
          raw: req.body,
        })
      })

      it('should redirect to the confirmation URL after saving data', async () => {
        const req = mockReq({ errors: { body: {} } })
        const res = mockRes()

        await controller.post(req, res, jest.fn)

        expect(res.redirect).toHaveBeenCalledWith(URLs.CREATE_STEP)
      })
    })
  })

  describe('get', () => {
    const params = { areaOfNeed: 'an-area-of-need' }

    it('should render with errors when there are validation errors but no exceptions thrown', async () => {
      const req = mockReq({ params })
      const res = mockRes()
      const next = jest.fn()

      await controller.get(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/create-goal', {
        locale: locale.en,
        data: {
          popData: testPopData,
          noteData: testNoteData,
          dateOptionsDate: expect.anything(),
          referenceData: testReferenceData[0],
          form: req.body,
        },
        errors: {},
      })
    })

    it('should forward to error handler if an exception occurs', async () => {
      const req = mockReq()
      const res = mockRes()
      const next = jest.fn()
      const testError = new Error('test error')

      mockReferentialDataService.getQuestionDataByAreaOfNeed.mockRejectedValue(testError)

      await controller.get(req, res, next)

      expect(res.render).not.toHaveBeenCalledWith('pages/create-goal', expect.anything())
      expect(next).toHaveBeenCalledWith(testError)
    })

    it('should render', async () => {
      const req = mockReq()
      const res = mockRes()
      const next = jest.fn()

      await controller.get(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/create-goal', {
        locale: locale.en,
        data: {
          popData: testPopData,
          noteData: testNoteData,
          dateOptionsDate: expect.anything(),
          referenceData: testReferenceData[0].goals[0],
          form: {},
        },
        errors: {},
      })
    })
  })
})
