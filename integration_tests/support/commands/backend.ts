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

export const enterSentencePlan = () => {
  cy.session(Cypress.env('last_sentence_plan').planUuid, () => {
    getApiToken().then(apiToken => {
      cy.request({
        url: `${Cypress.env('ARNS_HANDOVER_URL')}/handover`,
        method: 'POST',
        auth: { bearer: apiToken },
        body: {
          oasysAssessmentPk: Cypress.env('last_sentence_plan').oasysAssessmentPk,
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
          },
        },
      }).then(handoverResponse => {
        cy.visit(`${handoverResponse.body.handoverLink}?clientId=${Cypress.env('ARNS_HANDOVER_CLIENT_ID')}`)
      })
    })
  })
  cy.visit('about-pop')
}

export const createSentencePlan = () => {
  const oasysAssessmentPk = Math.random().toString().substring(2, 9)

  getApiToken().then(apiToken => {
    cy.request({
      url: `${Cypress.env('SP_API_URL')}/oasys/plans`,
      method: 'POST',
      auth: { bearer: apiToken },
      body: { oasysAssessmentPk },
    }).then(createResponse => {
      Cypress.env('last_sentence_plan', {
        planUuid: createResponse.body.uuid,
        oasysAssessmentPk,
      })
    })
  })
}