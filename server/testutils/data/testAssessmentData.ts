import { AssessmentResponse } from '../../@types/Assessment'
import { CriminogenicNeedScore, Section } from '../../@types/CriminogenicNeedsType'

export const incompleteAssessmentData: AssessmentResponse = {
  lastUpdatedTimestampSAN: '2024-10-04T15:22:31.453096',
  sanAssessmentData: {
    employment_education_practitioner_analysis_risk_of_serious_harm: { value: 'NO' },
    employment_education_practitioner_analysis_risk_of_reoffending: { value: 'YES' },
    employment_education_practitioner_analysis_strengths_or_protective_factors: { value: 'YES' },
    employment_education_section_complete: { value: 'YES' },
    employment_education_changes: {
      value: 'NEEDS_HELP_TO_MAKE_CHANGES',
      values: null,
      collection: null,
    },
    accommodation_practitioner_analysis_risk_of_serious_harm: { value: 'NO' },
    accommodation_practitioner_analysis_risk_of_reoffending: { value: 'YES' },
    accommodation_practitioner_analysis_strengths_or_protective_factors: { value: 'NO' },
    accommodation_section_complete: { value: 'YES' },
    accommodation_changes: {
      value: 'THINKING_ABOUT_MAKING_CHANGES',
      values: null,
      collection: null,
    },
    health_wellbeing_practitioner_analysis_risk_of_serious_harm: { value: 'NO' },
    health_wellbeing_practitioner_analysis_risk_of_reoffending: { value: 'NO' },
    health_wellbeing_practitioner_analysis_strengths_or_protective_factors: { value: 'NO' },
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
    accommodation_practitioner_analysis_risk_of_serious_harm: { value: 'NO' },
    accommodation_practitioner_analysis_risk_of_reoffending: { value: 'YES' },
    accommodation_practitioner_analysis_strengths_or_protective_factors: { value: 'NO' },
    accommodation_section_complete: { value: 'YES' },
    accommodation_changes: {
      value: 'THINKING_ABOUT_MAKING_CHANGES',
      values: null,
      collection: null,
    },
    employment_education_practitioner_analysis_risk_of_serious_harm: { value: 'NO' },
    employment_education_practitioner_analysis_risk_of_reoffending: { value: 'YES' },
    employment_education_practitioner_analysis_strengths_or_protective_factors: { value: 'YES' },
    employment_education_section_complete: { value: 'YES' },
    employment_education_changes: {
      value: 'NEEDS_HELP_TO_MAKE_CHANGES',
      values: null,
      collection: null,
    },
    health_wellbeing_practitioner_analysis_risk_of_serious_harm: { value: 'NO' },
    health_wellbeing_practitioner_analysis_risk_of_reoffending: { value: 'NO' },
    health_wellbeing_practitioner_analysis_strengths_or_protective_factors: { value: 'NO' },
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
    drug_use_practitioner_analysis_risk_of_serious_harm: { value: 'NO' },
    drug_use_practitioner_analysis_risk_of_reoffending: { value: 'NO' },
    drug_use_practitioner_analysis_strengths_or_protective_factors: { value: 'NO' },
    drug_use_section_complete: { value: 'YES' },
    drug_use_changes: {
      value: 'MAKING_CHANGES',
      values: null,
      collection: null,
    },
    thinking_behaviours_attitudes_practitioner_analysis_risk_of_serious_harm: { value: 'NO' },
    thinking_behaviours_attitudes_practitioner_analysis_risk_of_reoffending: { value: 'NO' },
    thinking_behaviours_attitudes_practitioner_analysis_strengths_or_protective_factors: { value: 'NO' },
    thinking_behaviours_attitudes_section_complete: { value: 'YES' },
    thinking_behaviours_attitudes_changes: {
      value: 'MAKING_CHANGES',
      values: null,
      collection: null,
    },
    finance_practitioner_analysis_risk_of_serious_harm: { value: 'NO' },
    finance_practitioner_analysis_risk_of_reoffending: { value: 'NO' },
    finance_practitioner_analysis_strengths_or_protective_factors: { value: 'NO' },
    finance_section_complete: { value: 'YES' },
    finance_changes: {
      value: 'MAKING_CHANGES',
      values: null,
      collection: null,
    },
    personal_relationships_practitioner_analysis_risk_of_serious_harm: { value: 'NO' },
    personal_relationships_practitioner_analysis_risk_of_reoffending: { value: 'NO' },
    personal_relationships_practitioner_analysis_strengths_or_protective_factors: { value: 'NO' },
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

export const fullCrimNeeds: CriminogenicNeedScore[] = [
  {
    section: Section.ACCOMMODATION,
    score: 6, // out of 6
  },
  {
    section: Section.EDUCATION_TRAINING_AND_EMPLOYABILITY,
    score: 1, // out of 4
  },
  {
    section: Section.ALCOHOL_MISUSE,
    score: null,
  },
  {
    section: Section.DRUG_MISUSE,
    score: null,
  },
  {
    section: Section.THINKING_AND_BEHAVIOUR,
    score: 1,
  },
  {
    section: Section.RELATIONSHIPS,
    score: 6,
  },
]

export const crimNeedsSubset: CriminogenicNeedScore[] = [
  {
    section: Section.ACCOMMODATION,
    score: 6, // out of 6
  },
  {
    section: Section.EDUCATION_TRAINING_AND_EMPLOYABILITY,
    score: 1, // out of 4
  },
  {
    section: Section.ALCOHOL_MISUSE,
    score: null,
  },
  {
    section: Section.DRUG_MISUSE,
    score: null,
  },
]

// Test data for the criminogenic needs that need ordering by difference between score and Need threshold
export const crimNeedsOrdered: CriminogenicNeedScore[] = [
  {
    section: Section.ACCOMMODATION,
    score: 3,
  },
  {
    section: Section.EDUCATION_TRAINING_AND_EMPLOYABILITY,
    score: 1, // out of 4
  },
  {
    section: Section.ALCOHOL_MISUSE,
    score: 1,
  },
  {
    section: Section.DRUG_MISUSE,
    score: 4,
  },
  {
    section: Section.THINKING_AND_BEHAVIOUR,
    score: 5,
  },
  {
    section: Section.RELATIONSHIPS,
    score: 6,
  },
]
