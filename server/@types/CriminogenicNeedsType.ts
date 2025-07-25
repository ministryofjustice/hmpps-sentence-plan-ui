export type CriminogenicNeeds = {
  identifiedNeeds: AssessmentOfNeed[]
  notIdentifiedNeeds: AssessmentOfNeed[]
  unansweredNeeds: AssessmentOfNeed[]
  assessedOn: string
}

type AssessmentOfNeed = {
  section: Section
  name: string
  riskOfHarm?: boolean
  riskOfReoffending?: boolean
  severity?: Severity
  score?: number
  oasysThreshold?: number
  tierThreshold?: number
}

export enum Section {
  ACCOMMODATION = 'ACCOMMODATION',
  EDUCATION_TRAINING_AND_EMPLOYABILITY = 'EDUCATION_TRAINING_AND_EMPLOYABILITY',
  RELATIONSHIPS = 'RELATIONSHIPS',
  LIFESTYLE_AND_ASSOCIATES = 'LIFESTYLE_AND_ASSOCIATES',
  DRUG_MISUSE = 'DRUG_MISUSE',
  ALCOHOL_MISUSE = 'ALCOHOL_MISUSE',
  THINKING_AND_BEHAVIOUR = 'THINKING_AND_BEHAVIOUR',
  ATTITUDE = 'ATTITUDE',
}

enum Severity {
  SEVERE = 'SEVERE',
  STANDARD = 'STANDARD',
  NO_NEED = 'NO_NEED',
}

export interface CriminogenicNeedScore {
  section: Section
  score: number | null
}
