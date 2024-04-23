export type Goal = {
  id: number
  title: string
  areaOfNeed: string
  creationDate: Date
  completedDate?: Date
  targetDate: Date
  isAgreed: boolean
  agreementNote: string
}
