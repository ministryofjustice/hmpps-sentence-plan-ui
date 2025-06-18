describe('Agree plan', () => {
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
    cy.get('#step-actor-1').select('Probation practitioner')
    cy.get(`#step-description-1`).type('Check that the subject is adhering to a lease agreement')
    cy.get('button').contains('Save and continue').click()
    cy.get('button').contains('Agree plan').click()
  })

  it('Agree plan - base', () => {
    cy.compareSnapshot('base-page')
  })

  it('Agree plan - no options selected error validation', () => {
    cy.get('button').contains('Save').click()
    cy.compareSnapshot('no-options-error-validation-page')
  })

  it('Agree plan - subject does not agree to plan', () => {
    cy.get('#agree-plan-radio-2').click()
    cy.compareSnapshot('no-agreement-page')
  })

  it('Agree plan - subject does not agree to plan error validation', () => {
    cy.get('#agree-plan-radio-2').click()
    cy.get('button').contains('Save').click()
    cy.compareSnapshot('no-agreement-error-validation-page')
  })

  it('Agree plan - subject cannot agree to plan', () => {
    cy.get('#agree-plan-radio-4').click()
    cy.get('button').contains('Save').click()
    cy.compareSnapshot('cannot-agree-page')
  })

  it('Agree plan - subject cannot agree to plan error validation', () => {
    cy.get('#agree-plan-radio-4').click()
    cy.get('button').contains('Save').click()
    cy.compareSnapshot('cannot-agree-error-validation-page')
  })
})
