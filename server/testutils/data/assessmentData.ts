import { AssessmentResponse, CriminogenicNeedsData } from '../../@types/Assessment'

export const assessmentDataNoAssessments: AssessmentResponse = {
  lastUpdatedTimestampSAN: '2024-10-04T15:22:31.453096',
  sanAssessmentData: {},
  sanOasysEquivalent: {},
}

export const assessmentData: AssessmentResponse = {
  lastUpdatedTimestampSAN: '2024-10-04T15:22:31.453096',
  sanAssessmentData: {
    employment_education_changes: {
      value: 'NEEDS_HELP_TO_MAKE_CHANGES',
      values: null,
      collection: null,
    },
    accommodation_changes: {
      value: 'THINKING_ABOUT_MAKING_CHANGES',
      values: null,
      collection: null,
    },
  },
  sanOasysEquivalent: {},
}

export const assessmentUndefined: AssessmentResponse = {
  lastUpdatedTimestampSAN: undefined,
  sanAssessmentData: undefined,
  sanOasysEquivalent: undefined,
}

export const crimNeedsSubset: CriminogenicNeedsData = {
  accommodation: {
    accLinkedToHarm: 'NO',
    accLinkedToReoffending: 'YES',
    accStrengths: 'NO',
    accOtherWeightedScore: '6', // out of 6
    accThreshold: 'YES',
  },
  educationTrainingEmployability: {
    eteLinkedToHarm: 'NO',
    eteLinkedToReoffending: 'YES',
    eteStrengths: 'YES',
    eteOtherWeightedScore: '1', // out of 4
    eteThreshold: 'YES',
  },
  healthAndWellbeing: {
    emoLinkedToHarm: 'NO',
    emoLinkedToReoffending: 'NO',
    emoStrengths: 'NO',
    emoOtherWeightedScore: 'N/A',
    emoThreshold: 'N/A',
  },
  thinkingBehaviourAndAttitudes: null,
}

// Test data for the criminogenic needs that need ordering by difference between score and Need threshold
export const crimNeedsOrdered: CriminogenicNeedsData = {
  accommodation: {
    accLinkedToHarm: 'NULL',
    accLinkedToReoffending: 'NULL',
    accStrengths: 'NULL',
    accOtherWeightedScore: '3',
  },
  drugMisuse: {
    drugLinkedToHarm: 'NULL',
    drugLinkedToReoffending: 'NULL',
    drugStrengths: 'NULL',
    drugOtherWeightedScore: '4',
  },
  thinkingBehaviourAndAttitudes: {
    thinkLinkedToHarm: 'NULL',
    thinkLinkedToReoffending: 'NULL',
    thinkStrengths: 'NULL',
    thinkOtherWeightedScore: '5',
  },
}
