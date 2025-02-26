import { NextFunction, Request, Response } from 'express'
import ReferentialDataService from '../../services/sentence-plan/referentialDataService'
import locale from './locale.json'

import { NewGoal } from '../../@types/NewGoalType'
import { formatDateWithStyle } from '../../utils/utils'
import { requireAccessMode } from '../../middleware/authorisationMiddleware'
import { AccessMode } from '../../@types/Handover'
import { HttpError } from '../../utils/HttpError'
import { getDateOptions, getGoalTargetDate } from '../../utils/goalTargetDateUtils'
import { areaConfigs } from '../../utils/assessmentAreaConfig.json'
import { AssessmentAreaConfig } from '../../@types/Assessment'
import { getAssessmentDetailsForArea } from '../../utils/assessmentUtils'
import { getBackUrlFromState, redirectToNextState } from './stateJourneyMachine'
import transformRequest from '../../middleware/transformMiddleware'
import CreateGoalPostModel from './models/CreateGoalPostModel'
import validateRequest from '../../middleware/validationMiddleware'
import runMiddlewareChain from '../../testutils/runMiddlewareChain'

export default class CreateGoalController {
  constructor(private readonly referentialDataService: ReferentialDataService) {}

  private saveAndRedirect = async (req: Request, res: Response, next: NextFunction) => {
    const processedData: NewGoal = this.processGoalData(req.body)
    const type: string = processedData.targetDate == null ? 'future' : 'current'
    const planUuid = req.services.sessionService.getPlanUUID()

    try {
      const { uuid } = await req.services.goalService.saveGoal(processedData, planUuid)

      // we need to do URL substitution of parameters for the redirect so they need to be available to the redirectToNextState function
      req.body.uuid = uuid
      req.body.type = type

      return redirectToNextState(req, res)
    } catch (e) {
      return next(HttpError(500, e.message))
    }
  }

  private render = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { errors } = req
      const type = req.query?.type ?? 'current'

      const areasOfNeed = this.referentialDataService.getAreasOfNeed()
      const sortedAreasOfNeed = this.referentialDataService.getSortedAreasOfNeed()

      const dateOptions = getDateOptions()
      const selectedAreaOfNeed = areasOfNeed.find(areaOfNeed => areaOfNeed.url === req.params.areaOfNeed)
      const minimumDatePickerDate = formatDateWithStyle(new Date().toISOString(), 'short')

      const criminogenicNeedsData = req.services.sessionService.getCriminogenicNeeds()
      const planUuid = req.services.sessionService.getPlanUUID()
      const plan = await req.services.planService.getPlanByUuid(planUuid)

      // get assessment data or swallow the service error and set to null so the template knows this data is missing
      const assessmentDetailsForArea = await req.services.assessmentService
        .getAssessmentByUuid(planUuid)
        .then(assessmentResponse => {
          const assessmentData = assessmentResponse.sanAssessmentData
          const areaConfig: AssessmentAreaConfig = areaConfigs.find(config => config.area === selectedAreaOfNeed?.name)
          return getAssessmentDetailsForArea(criminogenicNeedsData, areaConfig, assessmentData)
        })
        .catch((): null => null)

      return res.render('pages/create-goal', {
        locale: locale.en,
        data: {
          planAgreementStatus: plan.agreementStatus,
          areasOfNeed,
          sortedAreasOfNeed,
          selectedAreaOfNeed,
          dateOptions,
          minimumDatePickerDate,
          assessmentDetailsForArea,
          returnLink: getBackUrlFromState(req, res, req.session.userJourney.state),
          form: req.body,
        },
        errors,
      })
    } catch (e) {
      return next(HttpError(500, e.message))
    }
  }

  private processGoalData(body: any) {
    const title = body['goal-input-autocomplete']
    const targetDate = getGoalTargetDate(
      body['start-working-goal-radio'],
      body['date-selection-radio'],
      body['date-selection-custom'],
    )
    const areaOfNeed = body['area-of-need']
    const relatedAreasOfNeed = body['related-area-of-need-radio'] === 'yes' ? body['related-area-of-need'] : undefined

    return {
      title,
      areaOfNeed,
      targetDate,
      relatedAreasOfNeed,
    }
  }

  private handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    if (Object.keys(req.errors.body).length) {
      return this.render(req, res, next)
    }
    return next()
  }

  private handleSaveAction = (req: Request, res: Response, next: NextFunction) => {
    return runMiddlewareChain(
      [
        requireAccessMode(AccessMode.READ_WRITE),
        transformRequest({
          body: CreateGoalPostModel,
        }),
        validateRequest(),
        this.handleValidationErrors,
        this.saveAndRedirect,
      ],
      req,
      res,
      next,
    )
  }

  private handleFormAction = (req: Request, res: Response, next: NextFunction) => {
    if (req.body.action === 'back') {
      return redirectToNextState(req, res)
    }

    this.handleSaveAction(req, res, next)
  }

  get = [requireAccessMode(AccessMode.READ_WRITE), this.render]

  post = this.handleFormAction
}
