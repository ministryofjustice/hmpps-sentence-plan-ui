describe('Current goal without steps', () => {
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
      cy.visit('/plan')
    })
    cy.contains('a', 'Create goal').click()
    cy.get(`#goal-input-autocomplete`).type('Get suitable accommodation')
    cy.get(`#related-area-of-need-radio-2`).click()
    cy.get('#start-working-goal-radio').click()
    cy.get('#date-selection-radio').click()
    cy.get('button').contains('Save without steps').click()
  })

  it('Plan overview - current goal without steps', () => {
    cy.compareSnapshot('current-goal-without-steps-page')
  })

  it('Plan overview - current goal without steps error validation', () => {
    cy.get('button').contains('Agree plan').click()
    cy.compareSnapshot('current-goal-without-steps-error-validation-page')
  })
})
