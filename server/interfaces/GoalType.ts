export type Goal = {
  id: number
  uuid: string
  title: string
  areaOfNeed: string
  creationDate: Date
  completedDate?: Date
  targetDate: Date
  isAgreed: boolean
  agreementNote: string
}
