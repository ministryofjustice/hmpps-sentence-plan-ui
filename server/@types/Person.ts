export interface Person {
  title: string
  firstName: string
  lastName: string
  gender: Gender
  doB: string
  crn: string
  prc: string
  courtOrderRequirements?: object
  sentences?: Sentence[]
}

export interface Sentence {
  description?: string
  startDate?: string
  endDate?: string
  programmeRequirement?: boolean
  unpaidWorkHoursOrdered?: number
  unpaidWorkMinutesCompleted?: number
  rarDaysOrdered?: number
  rarDaysCompleted?: number
}

enum Gender {
  female,
  male,
  other,
}
