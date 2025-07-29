import { Section } from './CriminogenicNeedsType'

export type AnswerDTOs = Record<string, AnswerDto>
export type OasysEquivalent = Record<string, string | string[]>

export interface AssessmentResponse {
  sanAssessmentData: AnswerDTOs
  sanOasysEquivalent: OasysEquivalent
  lastUpdatedTimestampSAN?: string
}

export interface AssessmentArea {
  criminogenicNeedMissing?: boolean
  criminogenicNeedsScore?: number
  goalRoute?: string
  isAssessmentSectionNotStarted: boolean
  isAssessmentSectionComplete: boolean
  isSanSectionComplete: boolean
  linkedToHarm: string
  linkedtoReoffending: string
  linkedtoStrengthsOrProtectiveFactors: string
  motivationToMakeChanges?: string
  overallScore?: number
  riskOfReoffendingDetails?: string
  riskOfSeriousHarmDetails?: string
  strengthsOrProtectiveFactors?: string
  thresholdValue?: number
  title: string
  upperBound?: number
}

export interface FormattedAssessment {
  isAssessmentComplete: boolean
  versionUpdatedAt?: string
  areas: {
    incompleteAreas: AssessmentArea[]
    lowScoring: AssessmentArea[]
    highScoring: AssessmentArea[]
    other: AssessmentArea[]
  }
}

export interface AssessmentAreaConfig {
  area: string
  crimNeedSection: Section | null
  assessmentKey: string
  goalRoute: string
  upperBound: number | null
}

export const enum FieldType {
  Text = 'TEXT',
  Radio = 'RADIO',
  CheckBox = 'CHECKBOX',
  TextArea = 'TEXT_AREA',
  Date = 'DATE',
  Dropdown = 'DROPDOWN',
  Hidden = 'HIDDEN',
  AutoComplete = 'AUTOCOMPLETE',
  Collection = 'COLLECTION',
}

export interface AnswerDto {
  type?: FieldType
  description?: string
  options?: Option[]
  value?: string
  values?: string[]
  collection?: Record<string, AnswerDto>[]
}

interface Option {
  value: string
  text: string
}

export interface SubAreaData {
  upperBound: number
  thresholdValue: number
  criminogenicNeedsScore: number | null
}
