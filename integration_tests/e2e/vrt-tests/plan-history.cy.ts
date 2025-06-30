describe('Plan history', () => {
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
    cy.get('#agree-plan-radio').click()
    cy.get('button').contains('Save').click()
  })

  it('Plan history - base', () => {
    cy.contains('a', 'Plan history').click()
    cy.compareSnapshot('base-page')
  })

  it('Plan history - update goal', () => {
    cy.contains('a', 'Update').click()
    cy.compareSnapshot('update-goal-page')
  })

  it('Plan history - confirm achievement of goal', () => {
    cy.contains('a', 'Update').click()
    cy.get('button').contains('Mark as achieved').click()
    cy.compareSnapshot('confirm-achieved-goal-page')
  })

  it('Plan history - view achieved goal details', () => {
    cy.contains('a', 'Update').click()
    cy.get('button').contains('Mark as achieved').click()
    cy.get('button').contains('Confirm').click()
    cy.contains('a', 'Achieved goals').click()
    cy.contains('a', 'View details').click()
    cy.compareSnapshot('achieved-goal-view-details-page')
  })

  it('Plan history - remove goal from a plan', () => {
    cy.contains('a', 'Update').click()
    cy.get('button').contains('Remove goal from plan').click()
    cy.compareSnapshot('remove-goal-page')
  })

  it('Plan history - remove goal from a plan error validation', () => {
    cy.contains('a', 'Update').click()
    cy.get('button').contains('Remove goal from plan').click()
    cy.get('button').contains('Confirm').click()
    cy.compareSnapshot('remove-goal-error-validation-page')
  })

  describe('Removed goal - view and re-add to plan', () => {
    beforeEach(() => {
      cy.contains('a', 'Update').click()
      cy.get('button').contains('Remove goal from plan').click()
      cy.get('#goal-removal-note').type('Goal completed.')
      cy.get('button').contains('Confirm').click()
      cy.contains('a', 'Removed goals').click()
      cy.contains('a', 'View details').click()
    })

    it('Plan history - view removed goal details', () => {
      cy.compareSnapshot('remove-goal-view-details-page')
    })

    it('Plan history - confirm adding a removed goal back into the plan', () => {
      cy.contains('a', 'Add to plan').click()
      cy.compareSnapshot('add-removed-goal-back-into-plan-page')
    })

    it('Plan history - confirm adding a removed goal back into the plan error validation', () => {
      cy.contains('a', 'Add to plan').click()
      cy.get('button').contains('Confirm').click()
      cy.compareSnapshot('add-removed-goal-back-into-plan-error-validation-page')
    })

    it('Plan overview - applying a removed goal as a current goal to the agreed plan', () => {
      cy.contains('a', 'Add to plan').click()
      cy.get('#re-add-goal-reason').type('Subject needs to find a new place to live.')
      cy.get('#start-working-goal-radio').click()
      cy.get('#date-selection-radio').click()
      cy.get('button').contains('Confirm').click()
      cy.compareSnapshot('remove-goal-added-as-current-goal-page')
    })
  })
})
