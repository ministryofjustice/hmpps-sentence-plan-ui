describe('Future goal without steps', () => {
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
      cy.visit('/plan')
    })
    cy.contains('a', 'Create goal').click()
    cy.get(`#goal-input-autocomplete`).type('Get suitable accommodation')
    cy.get(`#related-area-of-need-radio-2`).click()
    cy.get('#start-working-goal-radio-2').click()
    cy.get('button').contains('Save without steps').click()
  })

  it('Plan overview - future goal without steps', () => {
    cy.contains('a', 'Future goals').click()
    cy.compareSnapshot('future-goal-without-steps-page')
  })

  it('Plan overview - future goal without steps error validation', () => {
    cy.get('button').contains('Agree plan').click()
    cy.compareSnapshot('future-goal-without-steps-error-validation-page')
  })
})
