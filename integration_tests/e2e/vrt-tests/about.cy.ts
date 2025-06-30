describe('About', () => {
  it('About - base', () => {
    cy.createSentencePlan().then(planDetails => {
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
      cy.visit('/plan')
    })
    cy.get('.moj-primary-navigation__container').contains('a', 'About').click()
    cy.compareSnapshot('base-page')
  })
})
