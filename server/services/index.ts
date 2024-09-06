import { NextFunction, Request } from 'express'
import { dataAccess } from '../data'
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
import HmppsAuthClient from '../data/hmppsAuthClient'
import SentencePlanApiClient from '../data/sentencePlanApiClient'

export const services = () => {
  const { applicationInfo, handoverApiClient, hmppsAuditClient } = dataAccess()

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

export const requestServices = (appServices: Services) => ({
  sentencePlanApiClient: (req: Request) => new SentencePlanApiClient(new HmppsAuthClient(req)),
  formStorageService: (req: Request) => new FormStorageService(req),
  planService: (req: Request) => new PlanService(req.services.sentencePlanApiClient),
  goalService: (req: Request) => new GoalService(req.services.sentencePlanApiClient),
  stepService: (req: Request) => new StepService(req.services.sentencePlanApiClient),
  noteService: (req: Request) => new NoteService(req.services.sentencePlanApiClient),
  infoService: (req: Request) => new InfoService(req.services.sentencePlanApiClient),
  sessionService: (req: Request) =>
    new SessionService(req, appServices.handoverContextService, req.services.planService),
})

export type RequestServices = {
  [K in keyof ReturnType<typeof requestServices>]: ReturnType<ReturnType<typeof requestServices>[K]>
}

export type Services = ReturnType<typeof services>
