export type HandoverContextData = {
  handoverSessionId: string
  principal: HandoverPrincipal
  subject: HandoverSubject
  assessmentContext: HandoverAssessmentContext
}

export type HandoverPrincipal = {
  identifier: string
  displayName: string
  accessMode: string
  returnUrl?: string
}

export type HandoverSubject = {
  crn: string
  pnc: string
  nomisId?: string
  givenName: string
  familyName: string
  dateOfBirth: string
  gender: Gender
  location: 'PRISON' | 'COMMUNITY'
  sexuallyMotivatedOffenceHistory?: string
}

export type HandoverAssessmentContext = {
  oasysAssessmentPk: string
  assessmentVersion: number
}

export const enum Gender {
  NotKnown = 'NOT_KNOWN',
  Male = 'MALE',
  Female = 'FEMALE',
  NotSpecified = 'NOT_SPECIFIED',
}
