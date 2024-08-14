import { NextFunction, Request, Response } from 'express'
import { AreaOfNeed } from '../../testutils/data/referenceData'
import handoverData from '../../testutils/data/handoverData'
import ReferentialDataService from '../../services/sentence-plan/referentialDataService'
import EditGoalController from './EditGoalController'
import GoalService from '../../services/sentence-plan/goalService'
import mockReq from '../../testutils/preMadeMocks/mockReq'
import mockRes from '../../testutils/preMadeMocks/mockRes'
import { testGoal } from '../../testutils/data/goalData'
import locale from './locale.json'
import validate from '../../middleware/validationMiddleware'
import EditGoalPostModel from './models/EditGoalPostModel'
import URLs from '../URLs'
import { NewGoal } from '../../@types/NewGoalType'

jest.mock('../../services/sentence-plan/referentialDataService', () => {
  return jest.fn().mockImplementation(() => ({
    getAreasOfNeed: jest.fn().mockReturnValue(AreaOfNeed),
  }))
})

jest.mock('../../services/sessionService', () => {
  return jest.fn().mockImplementation(() => ({
    getSubjectDetails: jest.fn().mockReturnValue(handoverData.subject),
  }))
})

jest.mock('../../services/sentence-plan/goalService', () => {
  return jest.fn().mockImplementation(() => ({
    getGoal: jest.fn().mockReturnValue(testGoal),
    updateGoal: jest.fn().mockReturnValue(testGoal),
  }))
})

describe('EditGoalController', () => {
  let controller: EditGoalController
  let mockReferentialDataService: jest.Mocked<ReferentialDataService>
  let mockGoalService: jest.Mocked<GoalService>
  let req: Request
  let res: Response
  let next: NextFunction
  const viewData = {
    data: {
      areasOfNeed: AreaOfNeed,
      form: {},
      popData: handoverData.subject,
      selectedAreaOfNeed: AreaOfNeed.find(x => x.name === testGoal.areaOfNeed.name),
      minimumDatePickerDate: '01/01/2024',
      dateOptions: [
        new Date('2024-04-01T00:00:00.000Z'),
        new Date('2024-07-01T00:00:00.000Z'),
        new Date('2025-01-01T00:00:00.000Z'),
        new Date('2026-01-01T00:00:00.000Z'),
        new Date('2024-01-08T00:00:00.000Z'),
      ],
    },
    errors: {},
    locale: locale.en,
  }

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-01-01'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  beforeEach(() => {
    mockReferentialDataService = new ReferentialDataService() as jest.Mocked<ReferentialDataService>
    mockGoalService = new GoalService(null) as jest.Mocked<GoalService>
    req = mockReq()
    res = mockRes()
    next = jest.fn()

    controller = new EditGoalController(mockReferentialDataService, mockGoalService)
  })

  describe('get', () => {
    it('should render without validation errors', async () => {
      await controller.get(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/edit-goal', viewData)
    })

    it('should render with validation errors', async () => {
      const errors = {
        body: { 'date-selection-radio': { isNotEmpty: true } },
        params: {},
        query: {},
      }
      req.errors = errors
      const expectedViewData = {
        ...viewData,
        errors,
      }

      await controller.get(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/edit-goal', expectedViewData)
    })
  })

  describe('post', () => {
    describe('validation', () => {
      beforeEach(() => {
        req = { body: {} } as Request
      })

      describe('goal-input-autocomplete', () => {
        it('should add error if not provided', () => {
          validate({ body: EditGoalPostModel })(req, null, jest.fn)

          expect(req.errors.body).toMatchObject({
            'goal-input-autocomplete': { isNotEmpty: true },
          })
        })

        it('should not add error if provided', () => {
          req.body['goal-input-autocomplete'] = 'Title of a goal'

          validate({ body: EditGoalPostModel })(req, null, jest.fn)

          expect(req.errors.body).not.toMatchObject({
            'goal-input-autocomplete': { isNotEmpty: true },
          })
        })
      })

      describe('other-area-of-need-radio', () => {
        it('should add error if not provided', () => {
          validate({ body: EditGoalPostModel })(req, null, jest.fn)

          expect(req.errors.body).toMatchObject({
            'other-area-of-need-radio': { isNotEmpty: true },
          })
        })

        it('should not add error if provided', () => {
          req.body['other-area-of-need-radio'] = 'yes'

          validate({ body: EditGoalPostModel })(req, null, jest.fn)

          expect(req.errors.body).not.toMatchObject({
            'other-area-of-need-radio': { isNotEmpty: true },
          })
        })
      })

      describe('other-area-of-need', () => {
        it('should add error if "other-area-of-need-radio" is "yes" and "other-area-of-need" is not provided', () => {
          req.body['other-area-of-need-radio'] = 'yes'

          validate({ body: EditGoalPostModel })(req, null, jest.fn)

          expect(req.errors.body).toMatchObject({
            'other-area-of-need': { isNotEmpty: true },
          })
        })

        it('should not add error if "other-area-of-need-radio" is "yes" and "other-area-of-need" is provided', () => {
          req.body['other-area-of-need-radio'] = 'yes'
          req.body['other-area-of-need'] = 'Accommodation'

          validate({ body: EditGoalPostModel })(req, null, jest.fn)

          expect(req.errors.body).not.toMatchObject({
            'other-area-of-need': { isNotEmpty: true },
          })
        })

        it('should not add error if "other-area-of-need-radio" is not "yes"', () => {
          req.body['other-area-of-need-radio'] = 'no'

          validate({ body: EditGoalPostModel })(req, null, jest.fn)

          expect(req.errors.body).not.toMatchObject({
            'other-area-of-need': { isNotEmpty: true },
          })
        })
      })

      describe('start-working-goal-radio', () => {
        it('should add error if "start-working-goal-radio" is not provided', () => {
          validate({ body: EditGoalPostModel })(req, null, jest.fn)

          expect(req.errors.body).toMatchObject({
            'start-working-goal-radio': { isNotEmpty: true },
          })
        })

        it('should not add error if "start-working-goal-radio" is provided', () => {
          req.body['start-working-goal-radio'] = 'yes'

          validate({ body: EditGoalPostModel })(req, null, jest.fn)

          expect(req.errors.body).not.toMatchObject({
            'start-working-goal-radio': { isNotEmpty: true },
          })
        })
      })

      describe('date-selection', () => {
        it('should add error if "date-selection-radio" is not provided', () => {
          req.body['start-working-goal-radio'] = 'yes'

          validate({ body: EditGoalPostModel })(req, null, jest.fn)

          expect(req.errors.body).toMatchObject({
            'date-selection-radio': { isNotEmpty: true },
          })
        })

        it('should not add error if "date-selection-radio" is provided', () => {
          req.body['start-working-goal-radio'] = 'yes'
          req.body['date-selection-radio'] = 'custom'

          validate({ body: EditGoalPostModel })(req, null, jest.fn)

          expect(req.errors.body).not.toMatchObject({
            'date-selection-radio': { isNotEmpty: true },
          })
        })

        it('should add error if "date-selection-radio" is "custom", and "date-selection-custom" is not provided', () => {
          req.body['start-working-goal-radio'] = 'yes'
          req.body['date-selection-radio'] = 'custom'

          validate({ body: EditGoalPostModel })(req, null, jest.fn)

          expect(req.errors.body).toMatchObject({
            'date-selection-custom': { isNotEmpty: true },
          })
        })

        it('should not add error if "date-selection-radio" is "custom", and "date-selection-custom" is provided', () => {
          req.body['start-working-goal-radio'] = 'yes'
          req.body['date-selection-radio'] = 'custom'
          req.body['date-selection-custom'] = new Date()

          validate({ body: EditGoalPostModel })(req, null, jest.fn)

          expect(req.errors.body).not.toMatchObject({
            'date-selection-custom': { isNotEmpty: true },
          })
        })
      })
    })

    it('should save and redirect when there are no validation errors', async () => {
      const updatedGoal: NewGoal = {
        title: 'A new title for the test goal',
        areaOfNeed: testGoal.areaOfNeed.name,
        targetDate: viewData.data.dateOptions[1].toISOString(),
      }

      req.body = {
        'goal-input-autocomplete': updatedGoal.title,
        'area-of-need': updatedGoal.areaOfNeed,
        'other-area-of-need-radio': 'no',
        'start-working-goal-radio': 'yes',
        'date-selection-radio': updatedGoal.targetDate,
      }
      req.errors = {
        body: {},
      }
      req.params.uuid = testGoal.uuid
      req.query.type = 'some-type'

      await controller.post(req as Request, res as Response, next)

      expect(mockGoalService.updateGoal).toHaveBeenCalledWith(updatedGoal, testGoal.uuid)
      expect(res.redirect).toHaveBeenCalledWith(`${URLs.PLAN_SUMMARY}?status=updated&type=some-type`)
      expect(res.render).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    it('should render the form again if there are validation errors', async () => {
      const errors = {
        body: { 'date-selection-radio': { isNotEmpty: true } },
        params: {},
        query: {},
      }
      req.errors = errors
      const expectedViewData = {
        ...viewData,
        errors,
      }

      await controller.post(req as Request, res as Response, next)

      expect(res.render).toHaveBeenCalledWith('pages/edit-goal', expectedViewData)
    })

    it('should should return error page if there is an error saving the goal', async () => {
      const updatedGoal: NewGoal = {
        title: 'A new title for the test goal',
        areaOfNeed: testGoal.areaOfNeed.name,
        targetDate: viewData.data.dateOptions[1].toISOString(),
      }

      req.body = {
        'goal-input-autocomplete': updatedGoal.title,
        'area-of-need': updatedGoal.areaOfNeed,
        'other-area-of-need-radio': 'no',
        'start-working-goal-radio': 'yes',
        'date-selection-radio': updatedGoal.targetDate,
      }
      req.errors = {
        body: {},
      }
      const error = new Error('This is a test error')
      mockGoalService.updateGoal = jest.fn().mockRejectedValue(error)
      await controller.post(req as Request, res as Response, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })
})
