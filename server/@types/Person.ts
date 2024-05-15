export interface Person {
  title: string
  firstName: string
  lastName: string
  gender: Gender
  DoB: string
  CRN: string
  PNC: string
  courtOrderRequirements?: object
}
export enum Gender {
  female,
  male,
  other,
}
