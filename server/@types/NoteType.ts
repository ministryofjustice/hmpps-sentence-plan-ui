export type NoteType = {
  noteObject: string // Plan or Goal
  note: string // text of note
  additionalNote: string
  noteStatus: string // value of enum event matching the noteObject
  goalTitle: string
  goalUuid: string
  createdDate: string
  createdBy: string
}
