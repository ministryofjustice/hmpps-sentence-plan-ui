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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const requestServices = (appServices: Services) => ({
  formStorageService: (req: Request) => new FormStorageService(req),
  handoverContextService: (req: Request) => new HandoverContextService(req),
})

export type RequestServices = {
  [K in keyof ReturnType<typeof requestServices>]: ReturnType<ReturnType<typeof requestServices>[K]>
}

export type Services = ReturnType<typeof services>
