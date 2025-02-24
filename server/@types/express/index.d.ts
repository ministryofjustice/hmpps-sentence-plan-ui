import { RequestServices } from '../../services'
import { PlanType } from '../PlanType'
import { HandoverContextData, HandoverPrincipal } from '../Handover'
import { Token } from '../Token'
import stateJourneyMachine from '../../routes/createGoal/stateJourneyMachine'

export default {}

declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    nowInMinutes: number
    plan?: PlanType
    forms?: any
    handover?: HandoverContextData
    token: Token
    returnLink: string
    userJourney: {
      state: keyof typeof stateJourneyMachine.states // TODO obviously this won't work beyond createGoal
      prevState: keyof typeof stateJourneyMachine.states // TODO ditto
    }
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
        domain?: any
      }
      services: RequestServices
      journeyState: string
    }

    interface Locals {
      user: Express.User
    }
  }
}
