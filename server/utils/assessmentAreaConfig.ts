import { Section } from '../@types/CriminogenicNeedsType'
import { AssessmentAreaConfig } from '../@types/Assessment'

// eslint-disable-next-line import/prefer-default-export
export const areaConfigs: AssessmentAreaConfig[] = [
  {
    area: 'Thinking, behaviours and attitudes',
    crimNeedSection: Section.THINKING_AND_BEHAVIOUR,
    assessmentKey: 'thinking_behaviours_attitudes',
    goalRoute: 'thinking-behaviours-and-attitudes',
    upperBound: 10,
  },
  {
    area: 'Alcohol use',
    crimNeedSection: Section.ALCOHOL_MISUSE,
    assessmentKey: 'alcohol_use',
    goalRoute: 'alcohol-use',
    upperBound: 4,
  },
  {
    area: 'Health and wellbeing',
    crimNeedSection: null,
    assessmentKey: 'health_wellbeing',
    goalRoute: 'health-and-wellbeing',
    upperBound: null,
  },
  {
    area: 'Accommodation',
    crimNeedSection: Section.ACCOMMODATION,
    assessmentKey: 'accommodation',
    goalRoute: 'accommodation',
    upperBound: 6,
  },
  {
    area: 'Employment and education',
    crimNeedSection: Section.EDUCATION_TRAINING_AND_EMPLOYABILITY,
    assessmentKey: 'employment_education',
    goalRoute: 'employment-and-education',
    upperBound: 4,
  },
  {
    area: 'Finances',
    crimNeedSection: null,
    assessmentKey: 'finance',
    goalRoute: 'finances',
    upperBound: null,
  },
  {
    area: 'Personal relationships and community',
    crimNeedSection: Section.RELATIONSHIPS,
    assessmentKey: 'personal_relationships_community',
    goalRoute: 'personal-relationships-and-community',
    upperBound: 6,
  },
  {
    area: 'Drug use',
    crimNeedSection: Section.DRUG_MISUSE,
    assessmentKey: 'drug_use',
    goalRoute: 'drug-use',
    upperBound: 8,
  },
]
