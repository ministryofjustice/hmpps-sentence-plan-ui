import { Request } from 'express'
import { dataAccess } from '../data'
import AuditService from './auditService'
import HelloWorldService from './sentence-plan/helloWorld'
import ReferentialDataService from './sentence-plan/referentialDataService'
import InfoService from './sentence-plan/infoService'
import NoteService from './sentence-plan/noteService'
import GoalService from './sentence-plan/goalService'
import StepService from './sentence-plan/stepsService'
import FormStorageService from './formStorageService'
import HandoverContextService from './handover/handoverContextService'
import PlanService from './sentence-plan/planService'
import SessionService from './sessionService'

export const services = () => {
  const { applicationInfo, sentencePlanApiClient, handoverApiClient, hmppsAuditClient } = dataAccess()

  const auditService = new AuditService(hmppsAuditClient)
  const helloWorldService = new HelloWorldService(sentencePlanApiClient)
  const referentialDataService = new ReferentialDataService(sentencePlanApiClient)
  const infoService = new InfoService(sentencePlanApiClient)
  const noteService = new NoteService(sentencePlanApiClient)
  const goalService = new GoalService(sentencePlanApiClient)
  const stepService = new StepService(sentencePlanApiClient)
  const planService = new PlanService(sentencePlanApiClient)
  const handoverContextService = new HandoverContextService(handoverApiClient)

  return {
    applicationInfo,
    auditService,
    helloWorldService,
    referentialDataService,
    handoverContextService,
    infoService,
    noteService,
    goalService,
    stepService,
    planService,
  }
}

export const requestServices = (appServices: Services) => ({
  formStorageService: (req: Request) => new FormStorageService(req),
  sessionService: (req: Request) =>
    new SessionService(req, appServices.handoverContextService, appServices.planService),
})

export type RequestServices = {
  [K in keyof ReturnType<typeof requestServices>]: ReturnType<ReturnType<typeof requestServices>[K]>
}

export type Services = ReturnType<typeof services>
