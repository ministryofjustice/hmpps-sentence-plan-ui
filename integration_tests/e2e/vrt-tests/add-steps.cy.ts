describe('Add/Change steps', () => {
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
    cy.get('button').contains('Add steps').click()
  })

  it('Add/Change steps - base', () => {
    cy.compareSnapshot('base-page')
  })

  it('Add/Change steps - single step error validation', () => {
    cy.get('button').contains('Save and continue').click()
    cy.compareSnapshot('single-step-error-validation-page')
  })

  it('Add/Change steps - multiple steps error validation', () => {
    cy.get('button').contains('Add another step').click()
    cy.get('button').contains('Save and continue').click()
    cy.compareSnapshot('multiple-step-error-validation-page')
  })
})
