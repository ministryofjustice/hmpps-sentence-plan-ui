describe('Attempt to access without having logged in', () => {
  it('Shows the 401 error page', () => {
    cy.visit('/plan', { failOnStatusCode: false })
    cy.get('.govuk-heading-l').should('have.text', 'You need to sign in to use this service')
    cy.contains('li', 'Go to the OASys homepage to sign-in')
    cy.contains('a', 'Go to the Manage People on Probation service').should(
      'have.attr',
      'href',
      Cypress.env('MPOP_URL'),
    )
  })
})
