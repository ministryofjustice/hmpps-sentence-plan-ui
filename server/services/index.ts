import { Request } from 'express'
import { dataAccess } from '../data'
import AuditService from './auditService'
import ReferentialDataService from './sentence-plan/referentialDataService'
import InfoService from './sentence-plan/infoService'
import GoalService from './sentence-plan/goalService'
import StepService from './sentence-plan/stepsService'
import FormStorageService from './formStorageService'
import HandoverContextService from './handover/handoverContextService'
import PlanService from './sentence-plan/planService'
import SessionService from './sessionService'
import HmppsAuthClient from '../data/hmppsAuthClient'
import SentencePlanApiClient from '../data/sentencePlanApiClient'
import CoordinatorApiClient from '../data/coordinatorApiClient'
import AssessmentService from './sentence-plan/assessmentService'
import SentencePlanAndDeliusApiClient from '../data/SentencePlanAndDeliusApiClient'
import SentencePlanAndDeliusService from './sentence-plan/sentencePlanAndDeliusService'

export const services = () => {
  const { applicationInfo, handoverApiClient } = dataAccess()

  const referentialDataService = new ReferentialDataService()
  const handoverContextService = new HandoverContextService(handoverApiClient)

  return {
    applicationInfo,
    referentialDataService,
    handoverContextService,
  }
}

export const requestServices = (appServices: Services) => ({
  sentencePlanApiClient: (req: Request) => new SentencePlanApiClient(new HmppsAuthClient(req)),
  sentencePlanAndDeliusApiClient: (req: Request) => new SentencePlanAndDeliusApiClient(new HmppsAuthClient(req)),
  assessmentApiClient: (req: Request) => new CoordinatorApiClient(new HmppsAuthClient(req)),
  formStorageService: (req: Request) => new FormStorageService(req),
  planService: (req: Request) => new PlanService(req.services.sentencePlanApiClient),
  goalService: (req: Request) => new GoalService(req.services.sentencePlanApiClient),
  stepService: (req: Request) => new StepService(req.services.sentencePlanApiClient),
  infoService: (req: Request) => new InfoService(req.services.sentencePlanApiClient),
  assessmentService: (req: Request) => new AssessmentService(req.services.assessmentApiClient),
  sentencePlanAndDeliusService: (req: Request) => new SentencePlanAndDeliusService(req.services.sentencePlanAndDeliusApiClient),
  sessionService: (req: Request) =>
    new SessionService(req, appServices.handoverContextService, req.services.planService),
  auditService: (req: Request) => new AuditService(appServices.applicationInfo, req.services.sessionService, req.id),
})

export type RequestServices = {
  [K in keyof ReturnType<typeof requestServices>]: ReturnType<ReturnType<typeof requestServices>[K]>
}

export type Services = ReturnType<typeof services>
