export type Goal = {
  id: number
  uuid: string
  title: string
  areaOfNeed: string
  creationDate: string
  completedDate?: string
  targetDate: string
  isAgreed?: boolean
  agreementNote: string
}
