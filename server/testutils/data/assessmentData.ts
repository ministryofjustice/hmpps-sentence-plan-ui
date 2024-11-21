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

export const crimNeeds: CriminogenicNeedsData = {
  accommodation: {
    accLinkedToHarm: 'NO',
    accLinkedToReoffending: 'YES',
    accStrengths: 'NO',
    accOtherWeightedScore: '6',
    accThreshold: 'YES',
  },
  educationTrainingEmployability: {
    eteLinkedToHarm: 'NO',
    eteLinkedToReoffending: 'YES',
    eteStrengths: 'YES',
    eteOtherWeightedScore: '1',
    eteThreshold: 'YES',
  },
  healthAndWellbeing: {
    emoLinkedToHarm: 'NO',
    emoLinkedToReoffending: 'NO',
    emoStrengths: 'NO',
    emoOtherWeightedScore: 'N/A',
    emoThreshold: 'N/A',
  },
}
