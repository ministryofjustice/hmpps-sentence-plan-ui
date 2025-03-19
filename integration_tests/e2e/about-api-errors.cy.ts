describe('Rendering About Person for READ_WRITE user', () => {
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('plan')
      cy.openSentencePlan(planDetails.oasysAssessmentPk, { crn: 'NOTFOUND' })
      cy.get('.moj-primary-navigation__container').contains('a', 'About').click()
      cy.url().should('include', '/about')
    })
  })

  it('Should check the page rendered correctly', () => {})
})
