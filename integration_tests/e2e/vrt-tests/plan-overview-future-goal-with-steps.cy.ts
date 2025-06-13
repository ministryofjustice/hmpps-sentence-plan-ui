describe('Future goal with steps', () => {
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
      cy.visit('/plan')
    })
    cy.contains('a', 'Create goal').click()
    cy.get(`#goal-input-autocomplete`).type('Get suitable accommodation')
    cy.get(`#related-area-of-need-radio-2`).click()
    cy.get('#start-working-goal-radio-2').click()
    cy.get('button').contains('Add steps').click()
    cy.get('#step-actor-1').select('Probation practitioner')
    cy.get(`#step-description-1`).type('Check that the subject is adhering to a lease agreement')
    cy.get('button').contains('Save and continue').click()
  })

  it('Plan overview - future goal with steps', () => {
    cy.contains('a', 'Future goals').click()
    cy.compareSnapshot('future-goal-with-steps-page')
  })

  it('Plan overview - future goal with steps error validation', () => {
    cy.get('button').contains('Agree plan').click()
    cy.compareSnapshot('future-goal-with-steps-error-validation-page')
  })
})
