import { RequestServices } from '../../services'
import { PlanType } from '../PlanType'
import { HandoverContextData, HandoverPrincipal } from '../Handover'

export default {}

declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    nowInMinutes: number
    plan?: PlanType
    forms?: any
    handover?: HandoverContextData
  }
}

export declare global {
  namespace Express {
    interface User extends Partial<HandoverPrincipal> {
      username: string
      token: string
      authSource: string
    }

    interface Request {
      verified?: boolean
      id: string
      logout(done: (err: unknown) => void): void
      errors?: {
        body?: any
        params?: any
        query?: any
      }
      services: RequestServices
    }

    interface Locals {
      user: Express.User
    }
  }
}
