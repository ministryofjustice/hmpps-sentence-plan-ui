describe('View Plan Overview for READ_WRITE user', () => {
  it('Redirects to the auth login page', () => {
    cy.visit('/plan')
    cy.url().should('equal', 'http://localhost:9090/auth/sign-in?redirect_uri=http://localhost:3000/sign-in/hmpps-auth/callback')
  })
})
