describe('Delete goal', () => {
  it('Delete goal - base', () => {
    cy.createSentencePlan().then(planDetails => {
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
      cy.visit('/plan')
    })
    cy.contains('a', 'Create goal').click()
    cy.get(`#goal-input-autocomplete`).type('Get suitable accommodation')
    cy.get(`#related-area-of-need-radio-2`).click()
    cy.get('#start-working-goal-radio-2').click()
    cy.get('button').contains('Save without steps').click()
    cy.contains('a', 'Future goals').click()
    cy.get('a').contains('Delete').click()
    cy.compareSnapshot('base-page')
  })
})
