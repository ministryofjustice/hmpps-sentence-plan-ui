import { Request } from 'express'

export default class FormHandlerService {
  constructor(private readonly req: Request) {}

  getFormData<T>(part: string): Form<T> {
    return this.req.session.forms ? this.req.session.forms[part] : undefined
  }

  saveFormData<T>(part: string, data: Form<T>): void {
    if (!this.req.session.forms) {
      this.req.session.forms = {}
    }
    this.req.session.forms[part] = data
  }

  clearFormData(part?: string): void {
    if (!part) {
      this.req.session.forms = {}
      return
    }

    if (this.req.session.forms && this.req.session.forms[part]) {
      delete this.req.session.forms[part]
    }
  }
}

export const FORMS = {
  CREATE_GOAL: 'create-goal',
  CREATE_STEPS: 'create-steps',
  CONFIRM_GOAL: 'confirm-goal',
}

type Form<T> = {
  processed: T
  raw: Record<string, string>
}
