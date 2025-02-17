import { AssessmentResponse, CriminogenicNeedsData } from '../../@types/Assessment'

/*
export const assessmentsIncomplete: AssessmentResponse = {
  lastUpdatedTimestampSAN: '2024-10-04T15:22:31.453096',
  sanAssessmentData: {
    accommodation_section_complete: { value: 'NO' },
    employment_education_section_complete: { value: 'NO' },
    health_wellbeing_section_complete: { value: 'NO' },
  },
  sanOasysEquivalent: {},
}
*/

export const incompleteAssessmentData: AssessmentResponse = {
  lastUpdatedTimestampSAN: '2024-10-04T15:22:31.453096',
  sanAssessmentData: {
    employment_education_section_complete: { value: 'YES' },
    employment_education_changes: {
      value: 'NEEDS_HELP_TO_MAKE_CHANGES',
      values: null,
      collection: null,
    },
    accommodation_section_complete: { value: 'YES' },
    accommodation_changes: {
      value: 'THINKING_ABOUT_MAKING_CHANGES',
      values: null,
      collection: null,
    },
    health_wellbeing_section_complete: { value: 'YES' },
    health_wellbeing_changes: {
      value: 'NEEDS_HELP_TO_MAKE_CHANGES',
      values: null,
      collection: null,
    },
  },
  sanOasysEquivalent: {},
}

// an assessment where each section is marked as complete
export const completeAssessmentData: AssessmentResponse = {
  lastUpdatedTimestampSAN: '2024-10-04T15:22:31.453096',
  sanAssessmentData: {
    accommodation_section_complete: { value: 'YES' },
    accommodation_changes: {
      value: 'THINKING_ABOUT_MAKING_CHANGES',
      values: null,
      collection: null,
    },
    employment_education_section_complete: { value: 'YES' },
    employment_education_changes: {
      value: 'NEEDS_HELP_TO_MAKE_CHANGES',
      values: null,
      collection: null,
    },
    health_wellbeing_section_complete: { value: 'YES' },
    health_wellbeing_changes: {
      value: 'NEEDS_HELP_TO_MAKE_CHANGES',
      values: null,
      collection: null,
    },
    alcohol_use_section_complete: { value: 'YES' },
    alcohol_use_changes: {
      value: 'MAKING_CHANGES',
      values: null,
      collection: null,
    },
    drug_use_section_complete: { value: 'YES' },
    drug_use_changes: {
      value: 'MAKING_CHANGES',
      values: null,
      collection: null,
    },
    thinking_behaviours_attitudes_section_complete: { value: 'YES' },
    thinking_behaviours_attitudes_changes: {
      value: 'MAKING_CHANGES',
      values: null,
      collection: null,
    },
    finance_section_complete: { value: 'YES' },
    finance_changes: {
      value: 'MAKING_CHANGES',
      values: null,
      collection: null,
    },
    personal_relationships_community_section_complete: { value: 'YES' },
    personal_relationships_community_changes: {
      value: 'MAKING_CHANGES',
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

export const fullCrimNeeds: CriminogenicNeedsData = {
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
  alcoholMisuse: {
    alcoholLinkedToHarm: 'NO',
    alcoholLinkedToReoffending: 'NO',
    alcoholStrengths: 'NO',
    alcoholOtherWeightedScore: 'N/A',
    alcoholThreshold: 'N/A',
  },
  drugMisuse: {
    drugLinkedToHarm: 'NO',
    drugLinkedToReoffending: 'NO',
    drugStrengths: 'NO',
    drugOtherWeightedScore: 'N/A',
    drugThreshold: 'N/A',
  },
  finance: {
    financeLinkedToHarm: 'NO',
    financeLinkedToReoffending: 'NO',
    financeStrengths: 'NO',
    financeOtherWeightedScore: 'N/A',
    financeThreshold: 'N/A',
  },
  thinkingBehaviourAndAttitudes: {
    thinkLinkedToHarm: 'NO',
    thinkLinkedToReoffending: 'NO',
    thinkStrengths: 'NO',
    thinkOtherWeightedScore: '1',
    thinkThreshold: 'YES',
  },
  personalRelationshipsAndCommunity: {
    relLinkedToHarm: 'NO',
    relLinkedToReoffending: 'NO',
    relStrengths: 'NO',
    relOtherWeightedScore: '6',
    relThreshold: 'YES',
  },
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
  alcoholMisuse: {
    alcoholLinkedToHarm: 'NO',
    alcoholLinkedToReoffending: 'NO',
    alcoholStrengths: 'NO',
    alcoholOtherWeightedScore: 'N/A',
    alcoholThreshold: 'N/A',
  },
  drugMisuse: {
    drugLinkedToHarm: 'NO',
    drugLinkedToReoffending: 'NO',
    drugStrengths: 'NO',
    drugOtherWeightedScore: 'N/A',
    drugThreshold: 'N/A',
  },
  thinkingBehaviourAndAttitudes: null,
  personalRelationshipsAndCommunity: null,
  finance: null,
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
