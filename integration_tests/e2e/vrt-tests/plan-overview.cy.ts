describe('Plan overview', () => {
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
      cy.visit('/plan')
    })
  })

  it('Plan overview - base', () => {
    cy.compareSnapshot('base-page')
  })

  it('Plan overview - base error validation', () => {
    cy.get('button').contains('Agree plan').click()
    cy.compareSnapshot('base-error-validation-page')
  })
})
