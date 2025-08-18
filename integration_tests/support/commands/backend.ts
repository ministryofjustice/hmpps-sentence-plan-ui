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
      bearer: apiToken
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
  options?: { accessMode?: string; planUuid?: string; planVersion?: number; crn?: string },
) => {
  const { accessMode = AccessMode.READ_WRITE, planUuid, crn } = options ?? {}
  cy.session(`${oasysAssessmentPk}_${accessMode}`, () => {
      getApiToken().then(apiToken => associateCrn(apiToken, planUuid, crn))
    }
  )

  cy.visit('/sign-in/hmpps-auth')
  cy.get('#username').type('AUTH_ADM')
  cy.get('#password').type('password123456')
  cy.get('#submit').click()

  return cy.visit('/plan')
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
      .then(createResponse => ({
        plan: {
          uuid: createResponse.body.sentencePlanId,
        },
        oasysAssessmentPk,
      })),
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
