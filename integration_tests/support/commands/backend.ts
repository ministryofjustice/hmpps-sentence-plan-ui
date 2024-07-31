import {NewGoal} from "../../../server/@types/NewGoalType";
import {NewStep} from "../../../server/@types/NewStepType";

const getApiToken = () => {
  const apiToken = Cypress.env('API_TOKEN')

  if (apiToken && apiToken.expiresAt > Date.now() + 2000) {
    return cy.wrap(apiToken.accessToken).then(token => token)
  }

  return cy
    .request({
      url: `${Cypress.env('HMPPS_AUTH_URL')}/auth/oauth/token?grant_type=client_credentials`,
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

export const openSentencePlan = (oasysAssessmentPk) => {
  cy.session(oasysAssessmentPk, () =>
    getApiToken().then(apiToken =>
      cy.request({
        url: `${Cypress.env('ARNS_HANDOVER_URL')}/handover`,
        method: 'POST',
        auth: { bearer: apiToken },
        body: {
          oasysAssessmentPk: oasysAssessmentPk,
          user: {
            identifier: 123,
            displayName: 'Cypress User',
            accessMode: 'READ_WRITE',
          },
          subjectDetails: {
            crn: 'X123456',
            pnc: '01/123456789A',
            givenName: 'Sam',
            familyName: 'Whitfield',
            dateOfBirth: '1970-01-01',
            gender: 0,
            location: 'COMMUNITY',
            sexuallyMotivatedOffenceHistory: 'NO',
          }
        }
      })
      .then(handoverResponse =>
        cy.visit(`${handoverResponse.body.handoverLink}?clientId=${Cypress.env('ARNS_HANDOVER_CLIENT_ID')}`)
      )
    )
  )

  return cy.visit('/')
}

export const createSentencePlan = () => {
  const oasysAssessmentPk = Math.random().toString().substring(2, 9)

  return getApiToken().then(apiToken =>
    cy.request({
      url: `${Cypress.env('SP_API_URL')}/oasys/plans`,
      method: 'POST',
      auth: {bearer: apiToken},
      body: {oasysAssessmentPk},
    }).then(createResponse => ({
      planUuid: createResponse.body.uuid,
      oasysAssessmentPk
    }))
  )
}

export const addGoalToPlan = (planUUid: string, goal: NewGoal) => {
  return getApiToken().then(apiToken =>
    cy.request({
      url: `${Cypress.env('SP_API_URL')}/plans/${planUUid}/goals`,
      method: 'POST',
      auth: { bearer: apiToken },
      body: goal
    }).then(createResponse => createResponse.body)
  )
}

export const addStepToGoal = (goalUuid: string, step: NewStep) => {
  return getApiToken().then(apiToken =>
    cy.request({
      url: `${Cypress.env('SP_API_URL')}/goals/${goalUuid}/steps`,
      method: 'POST',
      auth: { bearer: apiToken },
      body: [ step ],
    }).then(createResponse => createResponse.body)
  )
}
