import { NewGoal } from '../../../server/@types/NewGoalType'
import { NewStep } from '../../../server/@types/StepType'
import { AccessMode } from '../../../server/@types/Handover'
import { GoalStatus } from '../../../server/@types/GoalType'
import { PlanAgreement } from '../../../server/@types/PlanAgreement'
import { PlanAgreementStatus } from '../../../server/@types/PlanType'
import handoverData from '../../../server/testutils/data/handoverData'

const getApiToken = () => {
  const apiToken = Cypress.env('API_TOKEN')

  if (apiToken && apiToken.expiresAt > Date.now() + 2000) {
    return cy.wrap(apiToken.accessToken).then(token => token)
  }

  return cy
    .request({
      url: `${Cypress.env('HMPPS_AUTH_URL')}/auth/oauth/token?grant_type=client_credentials&username=SYSTEM|e2eTests`,
      method: 'POST',
      form: true,
      auth: {
        user: Cypress.env('CLIENT_ID'),
        pass: Cypress.env('CLIENT_SECRET'),
      },
    })
    .then(response => {
      Cypress.env('API_TOKEN', {
        accessToken: response.body.access_token,
        expiresAt: Date.now() + response.body.expires_in * 1000,
      })
      return response.body.access_token
    })
}

const associateCrn = (apiToken, planUuid: string, crn: string) => {
  cy.request({
    url: `${Cypress.env('SP_API_URL')}/plans/associate/${planUuid}/${crn}`,
    method: 'PUT',
    auth: {
      bearer: apiToken,
    },
  })
}

function createHandoverContext(apiToken, oasysAssessmentPk, accessMode, sentencePlanVersion, crn) {
  return {
    url: `${Cypress.env('ARNS_HANDOVER_URL')}/handover`,
    method: 'POST',
    auth: { bearer: apiToken },
    body: {
      oasysAssessmentPk,
      sentencePlanVersion,
      user: {
        identifier: 123,
        displayName: 'Cypress User',
        accessMode,
        returnUrl: Cypress.env('OASTUB_URL'),
      },
      subjectDetails: {
        crn: crn ?? 'A123456',
        pnc: '01/123456789A',
        givenName: 'Sam',
        familyName: 'Whitfield',
        dateOfBirth: '1970-01-01',
        gender: 0,
        location: 'COMMUNITY',
        sexuallyMotivatedOffenceHistory: 'NO',
      },
      criminogenicNeedsData: {
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
        finance: {
          financeLinkedToHarm: 'NO',
          financeLinkedToReoffending: 'NO',
          financeStrengths: 'NO',
          financeOtherWeightedScore: 'N/A',
          financeThreshold: 'N/A',
        },
        drugMisuse: {
          drugLinkedToHarm: 'NO',
          drugLinkedToReoffending: 'NO',
          drugStrengths: 'NO',
          drugOtherWeightedScore: 'NULL',
          drugThreshold: 'NO',
        },
        alcoholMisuse: {
          alcoholLinkedToHarm: 'NO',
          alcoholLinkedToReoffending: 'YES',
          alcoholStrengths: 'YES',
          alcoholOtherWeightedScore: '3',
          alcoholThreshold: 'YES',
        },
        healthAndWellbeing: {
          emoLinkedToHarm: 'NO',
          emoLinkedToReoffending: 'NO',
          emoStrengths: 'NO',
          emoOtherWeightedScore: 'N/A',
          emoThreshold: 'N/A',
        },
        personalRelationshipsAndCommunity: {
          relLinkedToHarm: 'NULL',
          relLinkedToReoffending: 'YES',
          relStrengths: 'NO',
          relOtherWeightedScore: '6',
          relThreshold: 'YES',
        },
        thinkingBehaviourAndAttitudes: {
          thinkLinkedToHarm: 'NO',
          thinkLinkedToReoffending: 'NO',
          thinkStrengths: 'NO',
          thinkOtherWeightedScore: '1',
          thinkThreshold: 'YES',
        },
        lifestyleAndAssociates: {
          lifestyleLinkedToHarm: 'N/A',
          lifestyleLinkedToReoffending: 'N/A',
          lifestyleStrengths: 'N/A',
          lifestyleOtherWeightedScore: '6',
          lifestyleThreshold: 'YES',
        },
      },
    },
  }
}

export const openSentencePlan = (
  oasysAssessmentPk: string,
  options?: { accessMode?: string; planVersion?: number; crn?: string },
) => {
  const { accessMode = AccessMode.READ_WRITE, planVersion, crn } = options ?? {}
  cy.session(`${oasysAssessmentPk}_${accessMode}`, () =>
    getApiToken().then(apiToken =>
      cy
        .request(createHandoverContext(apiToken, oasysAssessmentPk, accessMode, planVersion, crn))
        .then(handoverResponse =>
          cy.visit(`${handoverResponse.body.handoverLink}?clientId=${Cypress.env('ARNS_HANDOVER_CLIENT_ID')}`),
        ),
    ),
  )

  return cy.visit('/')
}

export const openSentencePlanAuth = (
  oasysAssessmentPk: string,
  options?: { accessMode?: string; planUuid?: string; planVersion?: number; crn?: string, username?: string },
) => {
  const { accessMode = AccessMode.READ_WRITE, planUuid, crn } = options ?? {}
  cy.session(`${oasysAssessmentPk}_${accessMode}`, () => {
    getApiToken().then(apiToken => associateCrn(apiToken, planUuid, crn))
  })

  cy.visit('/sign-in/hmpps-auth')
  cy.get('#username').type(options.username)
  cy.get('#password').type('password123456')
  cy.get('#submit').click()
}

export const createSentencePlan = () => {
  const oasysAssessmentPk = Math.random().toString().substring(2, 9)

  return getApiToken().then(apiToken =>
    cy
      .request({
        url: `${Cypress.env('COORDINATOR_API_URL')}/oasys/create`,
        method: 'POST',
        auth: { bearer: apiToken },
        body: {
          planType: 'INITIAL',
          userDetails: {
            id: '12345',
            name: 'Cypress',
          },
          oasysAssessmentPk,
        },
      })
      .then(createResponse =>
        cy
          .request({
            url: `${Cypress.env('SAN_API_URL')}/assessment/${createResponse.body.sanAssessmentId}/answers`,
            method: 'POST',
            auth: { bearer: apiToken },
            body: {
              answersToAdd: {
                accommodation_practitioner_analysis_risk_of_serious_harm: { value: 'NO' },
                accommodation_practitioner_analysis_risk_of_reoffending: { value: 'YES' },
                accommodation_practitioner_analysis_strengths_or_protective_factors: { value: 'NO' },
                accommodation_changes: { value: 'NOT_APPLICABLE' },
                accommodation_section_complete: { value: 'YES' },
                employment_education_practitioner_analysis_risk_of_serious_harm: { value: 'NO' },
                employment_education_practitioner_analysis_risk_of_reoffending: { value: 'YES' },
                employment_education_practitioner_analysis_risk_of_reoffending_yes_details: {
                  value:
                    'Sam does not perceive herself to be reckless or a risk-taker, stating that she did not believe that the alcohol she had consumed the previous evening would cause her to be over the limit feeling like ‘everyone does it’ in relation to driving home the next day. She described just being focused on the opportunity to do some outstanding household chores before her children came home. However, Sam accepts that she consumed the quantity of alcohol that she did and that she is responsible for her own actions.\n\nSam has now experienced two occasions in which her judgement and decision making has been impaired as a result of alcohol use. Additionally, when discussing the lead up to both the incidents Sam has been able to reflect that the circumstances preceding those nights were both stressful and overwhelming for her; therefore, using alcohol as a form of escapism. Sam is still in shock about the potential consequences her actions may have on her career, family and social services involvement however feels this is just a one off that won’t happen again.\n\nSam needs to understand how dealing with her problems is linked to her alcohol use and then recognising the consequences of her actions and behaviour once she has consumed alcohol to an unacceptable level. Her attitude towards how she behaves needs to be also explored further to also help reduce her risk of re offending whilst she justifies her behaviour by stating ‘everyone does it’.',
                },
                employment_education_practitioner_analysis_strengths_or_protective_factors: { value: 'YES' },
                employment_education_practitioner_analysis_strengths_or_protective_factors_yes_details: {
                  value:
                    'It is positive to see that from our discussions and exploration into the index offence, Sam is open to receiving support or guidance in ensuring she does not repeat this mistake again. Whilst she is not yet sure on what specifically she should work on, she presents as motivated to work with me to explore this further together.',
                },
                employment_education_changes: { value: 'MAKING_CHANGES' },
                employment_education_section_complete: { value: 'YES' },
                finance_practitioner_analysis_risk_of_serious_harm: { value: 'NO' },
                finance_practitioner_analysis_risk_of_reoffending: { value: 'NO' },
                finance_practitioner_analysis_risk_of_reoffending_no_details: {
                  value: 'There is no risk of reoffending',
                },
                finance_practitioner_analysis_strengths_or_protective_factors: { value: 'NO' },
                finance_practitioner_analysis_strengths_or_protective_factors_no_details: { value: 'Nothing to add' },
                finance_changes: { value: 'NOT_APPLICABLE' },
                finance_section_complete: { value: 'YES' },
                drug_use_practitioner_analysis_risk_of_serious_harm: { value: 'NO' },
                drug_use_practitioner_analysis_risk_of_reoffending: { value: 'NO' },
                drug_use_practitioner_analysis_strengths_or_protective_factors: { value: 'NO' },
                drug_use_changes: { value: 'MAKING_CHANGES' },
                drug_use_section_complete: { value: 'YES' },
                alcohol_use_practitioner_analysis_risk_of_serious_harm: { value: 'NO' },
                alcohol_use_practitioner_analysis_risk_of_reoffending: { value: 'YES' },
                alcohol_use_practitioner_analysis_strengths_or_protective_factors: { value: 'YES' },
                alcohol_use_changes: { value: 'MAKING_CHANGES' },
                alcohol_use_section_complete: { value: 'YES' },
                health_wellbeing_practitioner_analysis_risk_of_serious_harm: { value: 'NO' },
                health_wellbeing_practitioner_analysis_risk_of_serious_harm_no_details: {
                  value: 'There is no risk of serious harm',
                },
                health_wellbeing_practitioner_analysis_risk_of_reoffending: { value: 'NO' },
                health_wellbeing_practitioner_analysis_strengths_or_protective_factors: { value: 'NO' },
                health_wellbeing_changes: { value: 'NOT_APPLICABLE' },
                health_wellbeing_section_complete: { value: 'YES' },
                personal_relationships_community_practitioner_analysis_risk_of_reoffending: { value: 'YES' },
                personal_relationships_community_practitioner_analysis_strengths_or_protective_factors: { value: 'NO' },
                personal_relationships_community_changes: { value: 'MADE_CHANGES' },
                personal_relationships_community_section_complete: { value: 'NO' },
                thinking_behaviours_attitudes_practitioner_analysis_risk_of_serious_harm: { value: 'NO' },
                thinking_behaviours_attitudes_practitioner_analysis_risk_of_reoffending: { value: 'NO' },
                thinking_behaviours_attitudes_practitioner_analysis_strengths_or_protective_factors: { value: 'NO' },
                thinking_behaviours_attitudes_changes: { value: 'NEEDS_HELP_TO_MAKE_CHANGES' },
                thinking_behaviours_attitudes_section_complete: { value: 'YES' },
              },
              userDetails: {
                id: '12345',
                name: 'Cypress',
                type: 'SAN',
              },
            },
            retryOnNetworkFailure: false,
          })
          .then(() => ({
            plan: {
              uuid: createResponse.body.sentencePlanId,
            },
            oasysAssessmentPk,
          })),
      ),
  )
}

export const lockPlan = (planUuid: string) => {
  const lockBody = {
    userDetails: {
      id: '12345',
      name: 'Cypress',
    },
  }

  return getApiToken().then(apiToken =>
    cy
      .request({
        url: `${Cypress.env('SP_API_URL')}/coordinator/plan/${planUuid}/lock`,
        method: 'POST',
        auth: { bearer: apiToken },
        body: lockBody,
      })
      .then(createResponse => createResponse.body),
  )
}

export const addGoalToPlan = (planUUid: string, goal: NewGoal) => {
  return getApiToken().then(apiToken =>
    cy
      .request({
        url: `${Cypress.env('SP_API_URL')}/plans/${planUUid}/goals`,
        method: 'POST',
        auth: { bearer: apiToken },
        body: goal,
      })
      .then(createResponse => createResponse.body),
  )
}

export const removeGoalFromPlan = (goalUuid: string, note: string) => {
  const goal: Partial<NewGoal> = {
    status: GoalStatus.REMOVED,
    note,
  }

  return getApiToken().then(apiToken =>
    cy
      .request({
        url: `${Cypress.env('SP_API_URL')}/goals/${goalUuid}/remove`,
        method: 'POST',
        auth: { bearer: apiToken },
        body: goal,
      })
      .then(createResponse => createResponse.body),
  )
}

export const agreePlan = (planUUid: string) => {
  const agreement: PlanAgreement = {
    agreementStatus: PlanAgreementStatus.AGREED,
    practitionerName: handoverData.principal.displayName,
    personName: handoverData.subject.givenName,
    agreementStatusNote: 'Plan was agreed',
    optionalNote: '',
  }

  return getApiToken().then(apiToken =>
    cy
      .request({
        url: `${Cypress.env('SP_API_URL')}/plans/${planUUid}/agree`,
        method: 'POST',
        auth: { bearer: apiToken },
        body: agreement,
      })
      .then(createResponse => createResponse.body),
  )
}

export const addStepToGoal = (goalUuid: string, step: NewStep) => {
  return getApiToken().then(apiToken =>
    cy
      .request({
        url: `${Cypress.env('SP_API_URL')}/goals/${goalUuid}/steps`,
        method: 'POST',
        auth: { bearer: apiToken },
        body: [step],
      })
      .then(createResponse => createResponse.body),
  )
}
