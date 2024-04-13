import { dataAccess } from '../data'
import AuditService from './auditService'
import UserService from './userService'
import HelloWorldService from './helloWorld'

export const services = () => {
  const { applicationInfo, manageUsersApiClient, hmppsAuditClient } = dataAccess()

  const userService = new UserService(manageUsersApiClient)
  const auditService = new AuditService(hmppsAuditClient)
  const helloWorldService = new HelloWorldService()
  return {
    applicationInfo,
    userService,
    auditService,
    helloWorldService,
  }
}

export type Services = ReturnType<typeof services>

export { UserService }
