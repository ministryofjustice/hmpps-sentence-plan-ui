describe('Attempt to access without having logged in', () => {
  it('Shows the 401 error page', () => {
    cy.visit('/plan', { failOnStatusCode: false })
    cy.get('.govuk-heading-l').should('have.text', 'You need to sign in to use this service')
    cy.contains('a', 'the OASys homepage').should('have.attr', 'href', Cypress.env('OASYS_URL'))
    cy.contains('a', 'Manage people on probation').should('have.attr', 'href', Cypress.env('MPOP_URL'))
  })
})
