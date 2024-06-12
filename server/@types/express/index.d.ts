import type { UserDetails } from '../../services/userService'
import { RequestServices } from '../../services'

export default {}

declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    nowInMinutes: number
    forms?: any
  }
}

export declare global {
  namespace Express {
    interface User extends Partial<UserDetails> {
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
