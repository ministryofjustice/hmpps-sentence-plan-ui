export interface Person {
  title: string
  firstName: string
  lastName: string
  gender: Gender
  doB: string
  crn: string
  prc: string
  courtOrderRequirements?: object
}
export enum Gender {
  female,
  male,
  other,
}
