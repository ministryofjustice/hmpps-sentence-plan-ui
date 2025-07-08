export type CriminogenicNeeds = {
  identifiedNeeds: AssessmentOfNeed[]
  notIdentifiedNeeds: AssessmentOfNeed[]
  unansweredNeeds: AssessmentOfNeed[]
  assessedOn: string
}

type AssessmentOfNeed = {
  section: SectionStatus
  name: string
  riskOfHarm: boolean
  riskOfReoffending: boolean
  severity: SeverityStatus
  score: number
  oasysThreshold: number
  tierThreshold: number
}

enum SectionStatus {
  ACCOMMODATION = 'ACCOMMODATION',
  EDUCATION_TRAINING_AND_EMPLOYABILITY = 'EDUCATION_TRAINING_AND_EMPLOYABILITY',
  LIFESTYLE_AND_ASSOCIATES = 'LIFESTYLE_AND_ASSOCIATES',
  DRUG_MISUSE = 'DRUG_MISUSE',
  ATTITUDE = 'ATTITUDE',
  RELATIONSHIPS = 'RELATIONSHIPS',
  ALCOHOL_MISUSE = 'ALCOHOL_MISUSE',
  THINKING_AND_BEHAVIOUR = 'THINKING_AND_BEHAVIOUR',
}

enum SeverityStatus {
  SEVERE = 'SEVERE',
  STANDARD = 'STANDARD',
  NO_NEED = 'NO_NEED',
}
