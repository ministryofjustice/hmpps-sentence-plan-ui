export type Goal = {
  id: number
  uuid: string
  title: string
  areaOfNeed: {
    uuid: string,
    name: string
  },
  creationDate: string
  completedDate?: string
  targetDate: string
  isAgreed?: boolean
  agreementNote: string
  goalOrder?: number
  moveUpURL?: string
  moveDownURL?: string
}
