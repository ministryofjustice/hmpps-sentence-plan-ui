describe('Visual comparison testing', () => {
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
      cy.visit('/plan')
    })
  })

  describe('Change goal', () => {
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
      cy.contains('a', 'Future goals').click()
      cy.get('a').contains('Change goal').click()
    })

    it('Change goal - base', () => {
      cy.compareSnapshot('base-page')
    })

    it('Change goal - empty field error validation', () => {
      cy.get(`#goal-input-autocomplete`).clear()
      cy.get('button').contains('Save goal').click()
      cy.compareSnapshot('error-validation-page')
    })
  })
})
