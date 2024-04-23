import { dataAccess } from '../data'
import AuditService from './auditService'
import UserService from './userService'
import HelloWorldService from './sentence-plan/helloWorld'
import ReferentialDataService from './sentence-plan/referentialDataService'
import InfoService from './sentence-plan/infoService'
import NoteService from './sentence-plan/noteService'
import GoalService from './sentence-plan/goalService'
import StepService from './sentence-plan/stepsService'

export const services = () => {
  const { applicationInfo, manageUsersApiClient, sentencePlanApiClient, hmppsAuditClient } = dataAccess()

  const userService = new UserService(manageUsersApiClient)
  const auditService = new AuditService(hmppsAuditClient)
  const helloWorldService = new HelloWorldService(sentencePlanApiClient)
  const referentialDataService = new ReferentialDataService(sentencePlanApiClient)
  const infoService = new InfoService(sentencePlanApiClient)
  const noteService = new NoteService(sentencePlanApiClient)
  const goalService = new GoalService(sentencePlanApiClient)
  const stepService = new StepService(sentencePlanApiClient)

  return {
    applicationInfo,
    userService,
    auditService,
    helloWorldService,
    referentialDataService,
    infoService,
    noteService,
    goalService,
    stepService,
  }
}

export type Services = ReturnType<typeof services>

export { UserService }
