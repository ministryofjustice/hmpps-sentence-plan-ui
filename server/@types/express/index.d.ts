import { RequestServices } from '../../services'
import { HandoverContextData, AuthenticationDetails } from '../Handover'
import { Token } from '../Token'
import { SubjectDetails } from '../SessionType'
import { CriminogenicNeedsData } from '../Assessment'

export default {}

declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    crn: string
    nowInMinutes: number
    plan?: {
      id: string
      version: number | null
    }
    forms?: any
    handover?: HandoverContextData
    principal?: AuthenticationDetails
    subject?: SubjectDetails
    criminogenicNeeds: CriminogenicNeedsData
    token: Token
    returnLink: string
    oauthLogin?: { nonce: string; crn: string; returnTo?: string }
    previousVersion?: string
  }
}

export declare global {
  namespace Express {
    interface User extends Partial<AuthenticationDetails> {
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
    }

    interface Locals {
      user: Express.User
    }
  }
}
