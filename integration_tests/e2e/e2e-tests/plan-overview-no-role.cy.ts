describe('Attempt to access without having the role', () => {
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.openSentencePlanAuth(planDetails.oasysAssessmentPk, {
        planUuid: planDetails.plan.uuid,
        crn: 'X775086',
        username: 'AUTH_TEST',
      })
    })
  })

  it('Redirects to the error page', () => {
    cy.get('.govuk-heading-l').should('have.text', 'You need to sign in to use this service')
    cy.contains('a', 'Go to the Auth homepage').should(
      'have.attr',
      'href',
      'http://localhost:9090/auth/sign-in?redirect_uri=http://localhost:3000/sign-in/hmpps-auth/callback',
    )
  })

  it('gets the forbidden status as the user does not have ROLE_SENTENCE_PLAN', () => {
    cy.request({
      url: '/plan',
      followRedirect: false, // Do NOT follow, so you get the 4xx response
      failOnStatusCode: false,
    }).then(response => {
      expect(response.status).to.eq(401)
      expect(response.redirectedToUrl).to.eq(undefined) // Cypress does not set this if not following the redirect
    })
  })
})
