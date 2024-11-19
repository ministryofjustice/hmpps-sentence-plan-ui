import { CriminogenicNeedsData, SanAssessmentResponse } from '../../@types/Assessment'

export const assessmentDataNoAssessments: SanAssessmentResponse = {
  sanAssessmentData: {
    metaData: {
      uuid: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      createdAt: '2024-10-03T15:22:31.452243',
      versionUuid: 'd52fdb5d-4450-40af-806e-97d47b96fa57',
      versionCreatedAt: '2024-10-03T15:22:31.453096',
      versionUpdatedAt: '2024-10-04T15:22:31.453096',
    },
    assessment: {},
    oasysEquivalent: {},
  },
}

export const assessmentData: SanAssessmentResponse = {
  sanAssessmentData: {
    metaData: {
      uuid: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      createdAt: '2024-10-03T15:22:31.452243',
      versionUuid: 'd52fdb5d-4450-40af-806e-97d47b96fa57',
      versionCreatedAt: '2024-10-03T15:22:31.453096',
      versionUpdatedAt: '2024-10-04T15:22:31.453096',
    },
    assessment: {
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
    oasysEquivalent: {},
  },
}

export const assessmentUndefined: SanAssessmentResponse = {
  sanAssessmentData: {
    metaData: undefined,
    assessment: undefined,
    oasysEquivalent: undefined,
  },
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
    eteOtherWeightedScore: '2',
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
