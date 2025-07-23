import { NextFunction, Request, Response } from 'express'
import locale from './locale.json'
import URLs from '../URLs'
import { goalStatusToTabName, toKebabCase } from '../../utils/utils'
import validateRequest from '../../middleware/validationMiddleware'
import AddStepsPostModel, { StepModel } from './models/AddStepsPostModel'
import transformRequest from '../../middleware/transformMiddleware'
import { StepStatus } from '../../@types/StepType'
import { NewGoal } from '../../@types/NewGoalType'
import { requireAccessMode } from '../../middleware/authorisationMiddleware'
import { AccessMode } from '../../@types/Handover'
import { HttpError } from '../../utils/HttpError'
import { areaConfigs } from '../../utils/assessmentAreaConfig'
import { AssessmentAreaConfig } from '../../@types/Assessment'
import { getAssessmentDetailsForArea } from '../../utils/assessmentUtils'
import { AuditEvent } from '../../services/auditService'

export default class AddStepsController {
  private render = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { errors } = req
      const { type } = req.query
      const popData = await req.services.sessionService.getSubjectDetails()
      const goal = await req.services.goalService.getGoal(req.params.uuid)
      const steps = await req.services.stepService.getSteps(req.params.uuid)
      const returnLink = req.services.sessionService.getReturnLink() ?? `${URLs.PLAN_OVERVIEW}?type=${type}`
      const planUuid = req.services.sessionService.getPlanUUID()
      const plan = await req.services.planService.getPlanByUuid(planUuid)

      const criminogenicNeedScores = await req.services.arnsApiService.getCriminogenicNeeds(plan.crn)

      // get assessment data or swallow the service error and set to null so the template knows this data is missing
      const assessmentDetailsForArea = await req.services.assessmentService
        .getAssessmentByUuid(planUuid)
        .then(assessmentResponse => {
          const assessmentData = assessmentResponse.sanAssessmentData
          const areaConfig: AssessmentAreaConfig = areaConfigs.find(config => config.area === goal.areaOfNeed.name)
          return getAssessmentDetailsForArea(criminogenicNeedScores, areaConfig, assessmentData)
        })
        .catch((): null => null)

      if (!req.body.steps || req.body.steps.length === 0) {
        req.body.steps = steps.map(step => ({
          actor: step.actor,
          description: step.description,
          status: step.status,
        }))
      }

      return res.render('pages/add-steps', {
        locale: locale.en,
        data: {
          planAgreementStatus: plan.agreementStatus,
          goal,
          popData,
          areaOfNeed: toKebabCase(goal.areaOfNeed.name),
          assessmentDetailsForArea,
          returnLink,
          form: req.body,
        },
        errors,
      })
    } catch (e) {
      return next(HttpError(500, e.message))
    }
  }

  private saveAndRedirect = async (req: Request, res: Response, next: NextFunction) => {
    const updatedSteps = req.body.steps.map((step: StepModel) => ({
      description: step.description,
      actor: step.actor,
      status: step.status,
    }))

    const goalData: Partial<NewGoal> = {
      steps: updatedSteps,
    }

    try {
      await req.services.stepService.saveAllSteps(goalData, req.params.uuid)

      await req.services.auditService.send(AuditEvent.ADD_OR_CHANGE_STEPS, { goalUUID: req.params.uuid })

      const type = goalStatusToTabName(req.body.goalStatus)

      const link =
        req.services.sessionService.getReturnLink() === `/change-goal/${req.params.uuid}/`
          ? `${URLs.PLAN_OVERVIEW}?type=${type}`
          : req.services.sessionService.getReturnLink()

      return res.redirect(link)
    } catch (e) {
      return next(HttpError(500, e.message))
    }
  }

  private handleRemoveStep = (req: Request, res: Response, next: NextFunction) => {
    if (req.body.action.startsWith('remove-step-')) {
      const index = parseInt(req.body.action.split('remove-step-')[1], 10) - 1

      if (!Number.isNaN(index) && index >= 0 && index < req.body.steps.length) {
        delete req.body.action
        delete req.body[`step-actor-${index + 1}`]
        delete req.body[`step-description-${index + 1}`]
        delete req.body[`step-status-${index + 1}`]
        req.body.steps.splice(index, 1)

        return this.render(req, res, next)
      }

      return next(new Error('Invalid array'))
    }

    return next()
  }

  private handleClearStep = (req: Request, res: Response, next: NextFunction) => {
    if (req.body.action.startsWith('clear-step-')) {
      const defaultStepValue = {
        actor: 'Choose someone',
        description: '',
        status: StepStatus.NOT_STARTED,
      }

      req.body.steps.splice(0, 1, defaultStepValue)

      return this.render(req, res, next)
    }

    return next()
  }

  private handleAddStep = (req: Request, res: Response, next: NextFunction) => {
    if (req.body.action === 'add-step') {
      delete req.body.action
      req.body.steps.push({
        actor: 'Choose someone',
        description: '',
        status: StepStatus.NOT_STARTED,
      })

      return this.render(req, res, next)
    }
    return next()
  }

  private handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    if (Object.keys(req.errors?.body).length) {
      return this.render(req, res, next)
    }
    return next()
  }

  get = [requireAccessMode(AccessMode.READ_WRITE), this.render]

  post = [
    requireAccessMode(AccessMode.READ_WRITE),
    transformRequest({
      body: AddStepsPostModel,
    }),
    this.handleRemoveStep,
    this.handleClearStep,
    this.handleAddStep,
    validateRequest(),
    this.handleValidationErrors,
    this.saveAndRedirect,
  ]
}
