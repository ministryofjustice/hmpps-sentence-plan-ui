import { Section } from '../../@types/CriminogenicNeedsType'

// Anything higher than this value is considered high scoring.
// eslint-disable-next-line import/prefer-default-export
export const assessmentAreaThresholds: { [key in Section]: number } = {
  ACCOMMODATION: 1,
  ALCOHOL_MISUSE: 1,
  ATTITUDE: 2,
  DRUG_MISUSE: 0,
  EDUCATION_TRAINING_AND_EMPLOYABILITY: 1,
  LIFESTYLE_AND_ASSOCIATES: 1,
  RELATIONSHIPS: 1,
  THINKING_AND_BEHAVIOUR: 2,
}
