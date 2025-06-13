describe('Rendering About Person for READ_WRITE user', () => {
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('plan')
      cy.openSentencePlan(planDetails.oasysAssessmentPk, { crn: 'NOTFOUND' })
      cy.get('.moj-primary-navigation__container').contains('a', 'About').click()
      cy.url().should('include', '/about')
    })
  })

  it('Should check the page with nDelius error rendered correctly', () => {
    cy.get('.govuk-warning-text').should(
      'contain',
      'There is a problem getting the sentence information. Try reloading the page or try again later',
    )
    cy.get('.sentence-info').should('not.exist')
  })
})
