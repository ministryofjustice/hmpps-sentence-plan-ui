import { PreviousVersionsResponse } from '../../@types/PlanAndAssessmentVersions'
import { PlanAgreementStatus, PlanStatus } from '../../@types/PlanType'

// Below is the stub response received from coordinator,
// which includes the latest (current) version in allVersions field:
export const testPreviousVersionsResponse: PreviousVersionsResponse = {
  allVersions: {
    '2025-11-25': {
      description: 'Assessment and plan updated',
      assessmentVersion: {
        uuid: 'c85e56ff-0409-4037-8050-d2a2e5456b4e',
        version: 1,
        createdAt: '2025-11-25T08:30',
        updatedAt: '2025-11-25T08:30',
        status: 'UNSIGNED',
        planAgreementStatus: null,
        entityType: 'ASSESSMENT',
      },
      planVersion: {
        uuid: 'c85e56ff-0409-4037-8050-d2a2e5456b4e',
        version: 1,
        createdAt: '2025-11-25T08:30',
        updatedAt: '2025-11-25T08:30',
        status: PlanStatus.UNSIGNED,
        planAgreementStatus: PlanAgreementStatus.AGREED,
        entityType: 'PLAN',
      },
    },
    '2025-11-26': {
      description: 'Assessment and plan updated',
      assessmentVersion: {
        uuid: 'c85e56ff-0409-4037-8050-d2a2e5456b4e',
        version: 2,
        createdAt: '2025-11-26T08:30',
        updatedAt: '2025-11-26T08:30',
        status: 'UNSIGNED',
        planAgreementStatus: null,
        entityType: 'ASSESSMENT',
      },
      planVersion: {
        uuid: 'c85e56ff-0409-4037-8050-d2a2e5456b4e',
        version: 2,
        createdAt: '2025-11-26T08:30',
        updatedAt: '2025-11-26T08:30',
        status: PlanStatus.UNSIGNED,
        planAgreementStatus: PlanAgreementStatus.AGREED,
        entityType: 'PLAN',
      },
    },
  },
  countersignedVersions: {
    '2025-11-24': {
      description: 'Assessment and plan updated',
      assessmentVersion: {
        uuid: 'c85e56ff-0409-4037-8050-d2a2e5456b4e',
        version: 0,
        createdAt: '2025-11-24T08:30',
        updatedAt: '2025-11-24T08:30',
        status: 'COUNTERSIGNED',
        planAgreementStatus: null,
        entityType: 'ASSESSMENT',
      },
      planVersion: {
        uuid: 'c85e56ff-0409-4037-8050-d2a2e5456b4e',
        version: 0,
        createdAt: '2025-11-24T08:30',
        updatedAt: '2025-11-24T08:30',
        status: PlanStatus.COUNTERSIGNED,
        planAgreementStatus: PlanAgreementStatus.AGREED,
        entityType: 'PLAN',
      },
    },
  },
}

// And this is the output of previous versions controller,
// which removes the current versions from allVersions as per requirement to only show previous versions:
export const testPreviousVersionsResult: PreviousVersionsResponse = {
  allVersions: {
    '2025-11-25': {
      description: 'Assessment and plan updated',
      assessmentVersion: {
        uuid: 'c85e56ff-0409-4037-8050-d2a2e5456b4e',
        version: 1,
        createdAt: '2025-11-25T08:30',
        updatedAt: '2025-11-25T08:30',
        status: 'UNSIGNED',
        planAgreementStatus: null,
        entityType: 'ASSESSMENT',
      },
      planVersion: {
        uuid: 'c85e56ff-0409-4037-8050-d2a2e5456b4e',
        version: 1,
        createdAt: '2025-11-25T08:30',
        updatedAt: '2025-11-25T08:30',
        status: PlanStatus.UNSIGNED,
        planAgreementStatus: PlanAgreementStatus.AGREED,
        entityType: 'PLAN',
      },
    },
  },
  countersignedVersions: {
    '2025-11-24': {
      description: 'Assessment and plan updated',
      assessmentVersion: {
        uuid: 'c85e56ff-0409-4037-8050-d2a2e5456b4e',
        version: 0,
        createdAt: '2025-11-24T08:30',
        updatedAt: '2025-11-24T08:30',
        status: 'COUNTERSIGNED',
        planAgreementStatus: null,
        entityType: 'ASSESSMENT',
      },
      planVersion: {
        uuid: 'c85e56ff-0409-4037-8050-d2a2e5456b4e',
        version: 0,
        createdAt: '2025-11-24T08:30',
        updatedAt: '2025-11-24T08:30',
        status: PlanStatus.COUNTERSIGNED,
        planAgreementStatus: PlanAgreementStatus.AGREED,
        entityType: 'PLAN',
      },
    },
  },
}
