export type HandoverContextData = {
  handoverSessionId: string
  principal: HandoverPrincipal
  subject: HandoverSubject
  assessmentContext: HandoverAssessmentContext
  sentencePlanContext: HandoverSentencePlanContext
}

export type HandoverPrincipal = {
  identifier: string
  displayName: string
  accessMode: AccessMode
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

export type HandoverSentencePlanContext = {
  oasysAssessmentPk: string
  planId: string
  planVersion: number
}

export const enum AccessMode {
  READ_WRITE = 'READ_WRITE',
  READ_ONLY = 'READ_ONLY',
}

export const enum Gender {
  NotKnown = 0,
  Male = 1,
  Female = 2,
  NotSpecified = 9,
}
