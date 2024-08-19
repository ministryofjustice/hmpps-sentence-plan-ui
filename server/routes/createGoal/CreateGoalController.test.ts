import { NextFunction, Request, Response } from 'express'
import { AreaOfNeed } from '../../testutils/data/referenceData'
import handoverData from '../../testutils/data/handoverData'
import ReferentialDataService from '../../services/sentence-plan/referentialDataService'
import CreateGoalController from './CreateGoalController'
import GoalService from '../../services/sentence-plan/goalService'
import mockReq from '../../testutils/preMadeMocks/mockReq'
import mockRes from '../../testutils/preMadeMocks/mockRes'
import locale from './locale.json'
import validate from '../../middleware/validationMiddleware'
import CreateGoalPostModel from './models/CreateGoalPostModel'
import URLs from '../URLs'
import { testGoal, testNewGoal } from '../../testutils/data/goalData'

jest.mock('../../services/sentence-plan/referentialDataService', () => {
  return jest.fn().mockImplementation(() => ({
    getAreasOfNeed: jest.fn().mockReturnValue(AreaOfNeed),
  }))
})

jest.mock('../../services/sessionService', () => {
  return jest.fn().mockImplementation(() => ({
    getSubjectDetails: jest.fn().mockReturnValue(handoverData.subject),
    getPlanUUID: jest.fn().mockReturnValue('some-plan-uuid'),
  }))
})

jest.mock('../../services/sentence-plan/goalService', () => {
  return jest.fn().mockImplementation(() => ({
    saveGoal: jest.fn().mockResolvedValue({ uuid: 'new-goal-uuid' }),
  }))
})

describe('CreateGoalController', () => {
  let controller: CreateGoalController
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
      selectedAreaOfNeed: AreaOfNeed.find(x => x.url === 'area-url'),
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

    controller = new CreateGoalController(mockReferentialDataService, mockGoalService)
  })

  describe('get', () => {
    it('should render without validation errors', async () => {
      await controller.get(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/create-goal', viewData)
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

      expect(res.render).toHaveBeenCalledWith('pages/create-goal', expectedViewData)
    })
  })

  describe('post', () => {
    describe('validation', () => {
      beforeEach(() => {
        req = { body: {} } as Request
      })

      describe('goal-input-autocomplete', () => {
        it('should add error if not provided', () => {
          validate({ body: CreateGoalPostModel })(req, null, jest.fn)

          expect(req.errors.body).toMatchObject({
            'goal-input-autocomplete': { isNotEmpty: true },
          })
        })

        it('should not add error if provided', () => {
          req.body['goal-input-autocomplete'] = 'Title of a goal'

          validate({ body: CreateGoalPostModel })(req, null, jest.fn)

          expect(req.errors.body).not.toMatchObject({
            'goal-input-autocomplete': { isNotEmpty: true },
          })
        })
      })

      describe('related-area-of-need-radio', () => {
        it('should add error if not provided', () => {
          validate({ body: CreateGoalPostModel })(req, null, jest.fn)

          expect(req.errors.body).toMatchObject({
            'related-area-of-need-radio': { isNotEmpty: true },
          })
        })

        it('should not add error if provided', () => {
          req.body['related-area-of-need-radio'] = 'yes'

          validate({ body: CreateGoalPostModel })(req, null, jest.fn)

          expect(req.errors.body).not.toMatchObject({
            'related-area-of-need-radio': { isNotEmpty: true },
          })
        })
      })

      describe('related-area-of-need', () => {
        it('should add error if "related-area-of-need-radio" is "yes" and "other-area-of-need" is not provided', () => {
          req.body['related-area-of-need-radio'] = 'yes'

          validate({ body: CreateGoalPostModel })(req, null, jest.fn)

          expect(req.errors.body).toMatchObject({
            'related-area-of-need': { isNotEmpty: true },
          })
        })

        it('should not add error if "related-area-of-need-radio" is "yes" and "other-area-of-need" is provided', () => {
          req.body['related-area-of-need-radio'] = 'yes'
          req.body['related-area-of-need'] = 'Accommodation'

          validate({ body: CreateGoalPostModel })(req, null, jest.fn)

          expect(req.errors.body).not.toMatchObject({
            'related-area-of-need': { isNotEmpty: true },
          })
        })

        it('should not add error if "related-area-of-need-radio" is not "yes"', () => {
          req.body['related-area-of-need-radio'] = 'no'

          validate({ body: CreateGoalPostModel })(req, null, jest.fn)

          expect(req.errors.body).not.toMatchObject({
            'related-area-of-need': { isNotEmpty: true },
          })
        })
      })

      describe('start-working-goal-radio', () => {
        it('should add error if "start-working-goal-radio" is not provided', () => {
          validate({ body: CreateGoalPostModel })(req, null, jest.fn)

          expect(req.errors.body).toMatchObject({
            'start-working-goal-radio': { isNotEmpty: true },
          })
        })

        it('should not add error if "start-working-goal-radio" is provided', () => {
          req.body['start-working-goal-radio'] = 'yes'

          validate({ body: CreateGoalPostModel })(req, null, jest.fn)

          expect(req.errors.body).not.toMatchObject({
            'start-working-goal-radio': { isNotEmpty: true },
          })
        })
      })

      describe('date-selection', () => {
        it('should add error if "date-selection-radio" is not provided', () => {
          req.body['start-working-goal-radio'] = 'yes'

          validate({ body: CreateGoalPostModel })(req, null, jest.fn)

          expect(req.errors.body).toMatchObject({
            'date-selection-radio': { isNotEmpty: true },
          })
        })

        it('should not add error if "date-selection-radio" is provided', () => {
          req.body['start-working-goal-radio'] = 'yes'
          req.body['date-selection-radio'] = 'custom'

          validate({ body: CreateGoalPostModel })(req, null, jest.fn)

          expect(req.errors.body).not.toMatchObject({
            'date-selection-radio': { isNotEmpty: true },
          })
        })

        it('should add error if "date-selection-radio" is "custom", and "date-selection-custom" is not provided', () => {
          req.body['start-working-goal-radio'] = 'yes'
          req.body['date-selection-radio'] = 'custom'

          validate({ body: CreateGoalPostModel })(req, null, jest.fn)

          expect(req.errors.body).toMatchObject({
            'date-selection-custom': { isNotEmpty: true },
          })
        })

        it('should not add error if "date-selection-radio" is "custom", and "date-selection-custom" is provided', () => {
          req.body['start-working-goal-radio'] = 'yes'
          req.body['date-selection-radio'] = 'custom'
          req.body['date-selection-custom'] = new Date()

          validate({ body: CreateGoalPostModel })(req, null, jest.fn)

          expect(req.errors.body).not.toMatchObject({
            'date-selection-custom': { isNotEmpty: true },
          })
        })
      })
    })

    it('should save and redirect when there are no validation errors and action is not "addStep"', async () => {
      req.body = {
        'goal-input-autocomplete': testGoal.title,
        'area-of-need': testGoal.areaOfNeed.name,
        'related-area-of-need-radio': 'yes',
        'related-area-of-need': testNewGoal.relatedAreasOfNeed,
        'start-working-goal-radio': 'yes',
        'date-selection-radio': testGoal.targetDate,
        action: 'saveWithoutSteps',
      }
      req.errors = { body: {} }

      await controller.post(req as Request, res as Response, next)

      expect(mockGoalService.saveGoal).toHaveBeenCalledWith(testNewGoal, 'some-plan-uuid')
      expect(res.redirect).toHaveBeenCalledWith(`${URLs.PLAN_SUMMARY}?status=success`)
      expect(res.render).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    it('should save and redirect to create step when action is "addStep"', async () => {
      req.body = {
        'goal-input-autocomplete': testGoal.title,
        'area-of-need': testGoal.areaOfNeed.name,
        'related-area-of-need-radio': 'yes',
        'related-area-of-need': testNewGoal.relatedAreasOfNeed,
        'start-working-goal-radio': 'yes',
        'date-selection-radio': testGoal.targetDate,
        action: 'addStep',
      }
      req.errors = { body: {} }

      await controller.post(req as Request, res as Response, next)

      expect(mockGoalService.saveGoal).toHaveBeenCalledWith(testNewGoal, 'some-plan-uuid')
      expect(res.redirect).toHaveBeenCalledWith(URLs.CREATE_STEP)
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

      expect(res.render).toHaveBeenCalledWith('pages/create-goal', expectedViewData)
      expect(mockGoalService.saveGoal).not.toHaveBeenCalled()
      expect(res.redirect).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    it('should call next with an error if saveGoal fails', async () => {
      req.body = {
        'goal-input-autocomplete': testGoal.title,
        'area-of-need': testGoal.areaOfNeed.name,
        'related-area-of-need-radio': 'yes',
        'related-area-of-need': testNewGoal.relatedAreasOfNeed,
        'start-working-goal-radio': 'yes',
        'date-selection-radio': testGoal.targetDate,
        action: 'addStep',
      }
      req.errors = { body: {} }

      const error = new Error('This is a test error')
      mockGoalService.saveGoal = jest.fn().mockRejectedValue(error)

      await controller.post(req as Request, res as Response, next)

      expect(next).toHaveBeenCalledWith(error)
      expect(res.render).not.toHaveBeenCalled()
      expect(res.redirect).not.toHaveBeenCalled()
    })
  })
})