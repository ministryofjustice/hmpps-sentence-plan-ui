describe('Current goal with steps', () => {
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
  })

  it('Plan overview - current goal with steps ', () => {
    cy.compareSnapshot('current-goal-with-steps-page')
  })

  it('Plan overview - plan agreed', () => {
    cy.get('button').contains('Agree plan').click()
    cy.get('#agree-plan-radio').click()
    cy.get('button').contains('Save').click()
    cy.compareSnapshot('plan-agreed-page')
  })

  it('Plan overview - step marked as completed on updated goal for agreed plan', () => {
    cy.get('button').contains('Agree plan').click()
    cy.get('#agree-plan-radio').click()
    cy.get('button').contains('Save').click()
    cy.contains('a', 'Update').click()
    cy.get('#step-status-1').select('Completed')
    cy.get('button').contains('Save goal and steps').click()
    cy.compareSnapshot('step-completed-for-goal-of-agreed-plan-page')
  })

  it('Plan overview - confirm goal achieved', () => {
    cy.get('button').contains('Agree plan').click()
    cy.get('#agree-plan-radio').click()
    cy.get('button').contains('Save').click()
    cy.contains('a', 'Update').click()
    cy.get('button').contains('Mark as achieved').click()
    cy.get('button').contains('Confirm').click()
    cy.compareSnapshot('confirm-goal-achieved-page')
  })

  it('Plan overview - remove a goal from an agreed plan', () => {
    cy.get('button').contains('Agree plan').click()
    cy.get('#agree-plan-radio').click()
    cy.get('button').contains('Save').click()
    cy.contains('a', 'Update').click()
    cy.get('button').contains('Remove goal from plan').click()
    cy.get('#goal-removal-note').type('Goal completed.')
    cy.get('button').contains('Confirm').click()
    cy.compareSnapshot('remove-goal-from-plan-page')
  })
})
