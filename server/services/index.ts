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

export const services = () => {
  const { applicationInfo, sentencePlanApiClient, hmppsAuditClient } = dataAccess()

  const auditService = new AuditService(hmppsAuditClient)
  const referentialDataService = new ReferentialDataService()
  const infoService = new InfoService(sentencePlanApiClient)
  const noteService = new NoteService(sentencePlanApiClient)
  const goalService = new GoalService(sentencePlanApiClient)
  const stepService = new StepService(sentencePlanApiClient)
  const planService = new PlanService(sentencePlanApiClient)

  return {
    applicationInfo,
    auditService,
    referentialDataService,
    infoService,
    noteService,
    goalService,
    stepService,
    planService,
  }
}

export const requestServices = () => ({
  formStorageService: FormStorageService, // Assuming this is a class
  handoverContextService: HandoverContextService,
})

export type RequestServices = {
  [K in keyof ReturnType<typeof requestServices>]: InstanceType<ReturnType<typeof requestServices>[K]>
}

export type Services = ReturnType<typeof services>
