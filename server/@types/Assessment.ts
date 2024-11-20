export type AnswerDTOs = Record<string, AnswerDto>
export type OasysEquivalent = Record<string, string | string[]>

export interface AssessmentResponse {
  sanAssessmentData: AnswerDTOs
  sanOasysEquivalent: OasysEquivalent
  lastUpdatedTimestampSAN?: string
}

export interface AssessmentArea {
  title: string
  linkedtoRoSH: boolean
  linkedtoReoffending: boolean
  motivationToMakeChanges?: string
  riskOfSeriousHarm?: string
  riskOfReoffending: string
  strengthsOrProtectiveFactors?: string
  criminogenicNeedsScore?: string
  goalRoute?: string
}

export interface AssessmentAreas {
  lowScoring: AssessmentArea[]
  highScoring: AssessmentArea[]
  other: AssessmentArea[]
  versionUpdatedAt?: string
}

export interface AssessmentAreaConfig {
  area: string
  crimNeedsKey: string
  crimNeedsSubKey: string
  assessmentKey: string
  goalRoute: string
  upperBound?: number
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

export interface Accommodation {
  [key: string]: any
  accLinkedToHarm?: string
  accLinkedToReoffending?: string
  accStrengths?: string
  accOtherWeightedScore?: string
  accThreshold?: string
}

export interface EducationTrainingEmployability {
  [key: string]: any
  eteLinkedToHarm?: string
  eteLinkedToReoffending?: string
  eteStrengths?: string
  eteOtherWeightedScore?: string
  eteThreshold?: string
}

export interface Finance {
  [key: string]: string | undefined
  financeLinkedToHarm?: string
  financeLinkedToReoffending?: string
  financeStrengths?: string
  financeOtherWeightedScore?: string
  financeThreshold?: string
}

export interface DrugMisuse {
  [key: string]: string | undefined
  drugLinkedToHarm?: string
  drugLinkedToReoffending?: string
  drugStrengths?: string
  drugOtherWeightedScore?: string
  drugThreshold?: string
}

export interface AlcoholMisuse {
  [key: string]: string | undefined
  alcoholLinkedToHarm?: string
  alcoholLinkedToReoffending?: string
  alcoholStrengths?: string
  alcoholOtherWeightedScore?: string
  alcoholThreshold?: string
}

export interface HealthAndWellbeing {
  [key: string]: string | undefined
  emoLinkedToHarm?: string
  emoLinkedToReoffending?: string
  emoStrengths?: string
  emoOtherWeightedScore?: string
  emoThreshold?: string
}

export interface PersonalRelationshipsAndCommunity {
  [key: string]: any
  relLinkedToHarm?: string
  relLinkedToReoffending?: string
  relStrengths?: string
  relOtherWeightedScore?: string
  relThreshold?: string
}

export interface ThinkingBehaviourAndAttitudes {
  [key: string]: any
  thinkLinkedToHarm?: string
  thinkLinkedToReoffending?: string
  thinkStrengths?: string
  thinkOtherWeightedScore?: string
  thinkThreshold?: string
}

export interface LifestyleAndAssociates {
  [key: string]: any
  lifestyleLinkedToHarm?: string
  lifestyleLinkedToReoffending?: string
  lifestyleStrengths?: string
  lifestyleOtherWeightedScore?: string
  lifestyleThreshold?: string
}

export interface CriminogenicNeedsData {
  [key: string]: any
  accommodation?: Accommodation
  educationTrainingEmployability?: EducationTrainingEmployability
  finance?: Finance
  drugMisuse?: DrugMisuse
  alcoholMisuse?: AlcoholMisuse
  healthAndWellbeing?: HealthAndWellbeing
  personalRelationshipsAndCommunity?: PersonalRelationshipsAndCommunity
  thinkingBehaviourAndAttitudes?: ThinkingBehaviourAndAttitudes
  lifestyleAndAssociates?: LifestyleAndAssociates
}
