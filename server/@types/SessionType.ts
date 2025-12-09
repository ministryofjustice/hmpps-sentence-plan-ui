export type AuthenticationDetails = {
  identifier: string
  displayName: string
  accessMode: AccessMode
  returnUrl?: string
  authType?: AuthType
}

export type SubjectDetails = {
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

export const enum AuthType {
  OASYS = 'OASYS',
  HMPPS_AUTH = 'HMPPS_AUTH',
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
