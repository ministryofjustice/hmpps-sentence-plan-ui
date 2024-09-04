import { NextFunction, Request } from 'express'
import { dataAccess, HmppsAuthClient, SentencePlanApiClient } from '../data'
import AuditService from './auditService'
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
  const referentialDataService = new ReferentialDataService()
  const handoverContextService = new HandoverContextService(handoverApiClient)

  return {
    applicationInfo,
    auditService,
    referentialDataService,
    handoverContextService,
  }
}

export const requestServices = (appServices: Services) => {
  const sentencePlanApi = dataAccess().sentencePlanApiClient
  const planService = new PlanService(sentencePlanApi)

  return {
    formStorageService: (req: Request) => new FormStorageService(req),
    planService: (req: Request) => planService,
    goalService: (req: Request) => new GoalService(sentencePlanApi),
    stepService: (req: Request) => new StepService(sentencePlanApi),
    noteService: (req: Request) => new NoteService(sentencePlanApi),
    infoService: (req: Request) => new InfoService(sentencePlanApi),
    sessionService: (req: Request) => new SessionService(req, appServices.handoverContextService, planService),
  }
}

export type RequestServices = {
  [K in keyof ReturnType<typeof requestServices>]: ReturnType<ReturnType<typeof requestServices>[K]>
}

export type Services = ReturnType<typeof services>
