describe('Visual comparison testing', () => {
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
      cy.visit('/plan')
    })
  })

  describe('About', () => {
    it('About - base', () => {
      cy.get('.moj-primary-navigation__container').contains('a', 'About').click()
      cy.compareSnapshot('about-page')
    })
  })

  describe('Session timeout', () => {
    beforeEach(() => {
      cy.visit('/unsaved-information-deleted')
    })

    it('Session timeout - base', () => {
      cy.compareSnapshot('session-timeout-page')
    })

    it('Plan overview - return to plan after session timeout', () => {
      cy.contains('a', 'Go to the plan').click()
      cy.compareSnapshot('plan-overview-return-to-plan-after-session-timeout-page')
    })
  })

  describe('Plan overview', () => {
    describe('Base state', () => {
      it('Plan overview - base', () => {
        cy.compareSnapshot('plan-overview-page')
      })

      it('Plan overview - base error validation', () => {
        cy.get('button').contains('Agree plan').click()
        cy.compareSnapshot('plan-overview-base-error-validation-page')
      })
    })

    describe('Current goal without steps', () => {
      beforeEach(() => {
        cy.contains('a', 'Create goal').click()
        cy.get(`#goal-input-autocomplete`).type('Get suitable accommodation')
        cy.get(`#related-area-of-need-radio-2`).click()
        cy.get('#start-working-goal-radio').click()
        cy.get('#date-selection-radio').click()
        cy.get('button').contains('Save without steps').click()
      })

      it('Plan overview - current goal without steps', () => {
        cy.compareSnapshot('plan-overview-current-goal-without-steps-page')
      })

      it('Plan overview - current goal without steps error validation', () => {
        cy.get('button').contains('Agree plan').click()
        cy.compareSnapshot('plan-overview-current-goal-without-steps-error-validation-page')
      })
    })

    describe('Current goal with steps', () => {
      beforeEach(() => {
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
        cy.compareSnapshot('plan-overview-current-goal-with-steps-page')
      })

      it('Plan overview - plan agreed', () => {
        cy.get('button').contains('Agree plan').click()
        cy.get('#agree-plan-radio').click()
        cy.get('button').contains('Save').click()
        cy.compareSnapshot('plan-overview-plan-agreed-page')
      })

      it('Plan overview - step marked as completed on updated goal for agreed plan', () => {
        cy.get('button').contains('Agree plan').click()
        cy.get('#agree-plan-radio').click()
        cy.get('button').contains('Save').click()
        cy.contains('a', 'Update').click()
        cy.get('#step-status-1').select('Completed')
        cy.get('button').contains('Save goal and steps').click()
        cy.compareSnapshot('plan-overview-step-completed-for-goal-of-agreed-plan-page')
      })

      it('Plan overview - confirm goal achieved', () => {
        cy.get('button').contains('Agree plan').click()
        cy.get('#agree-plan-radio').click()
        cy.get('button').contains('Save').click()
        cy.contains('a', 'Update').click()
        cy.get('button').contains('Mark as achieved').click()
        cy.get('button').contains('Confirm').click()
        cy.compareSnapshot('plan-overview-confirm-goal-achieved-page')
      })

      it('Plan overview - remove a goal from an agreed plan', () => {
        cy.get('button').contains('Agree plan').click()
        cy.get('#agree-plan-radio').click()
        cy.get('button').contains('Save').click()
        cy.contains('a', 'Update').click()
        cy.get('button').contains('Remove goal from plan').click()
        cy.get('#goal-removal-note').type('Goal completed.')
        cy.get('button').contains('Confirm').click()
        cy.compareSnapshot('plan-overview-remove-goal-from-plan-page')
      })
    })

    describe('Future goal with steps', () => {
      beforeEach(() => {
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
        cy.compareSnapshot('plan-overview-future-goal-with-steps-page')
      })

      it('Plan overview - future goal with steps error validation', () => {
        cy.get('button').contains('Agree plan').click()
        cy.compareSnapshot('plan-overview-future-goal-with-steps-error-validation-page')
      })
    })

    describe('Future goal without steps', () => {
      beforeEach(() => {
        cy.contains('a', 'Create goal').click()
        cy.get(`#goal-input-autocomplete`).type('Get suitable accommodation')
        cy.get(`#related-area-of-need-radio-2`).click()
        cy.get('#start-working-goal-radio-2').click()
        cy.get('button').contains('Save without steps').click()
      })

      it('Plan overview - future goal without steps', () => {
        cy.contains('a', 'Future goals').click()
        cy.compareSnapshot('plan-overview-future-goal-without-steps-page')
      })

      it('Plan overview - future goal without steps error validation', () => {
        cy.get('button').contains('Agree plan').click()
        cy.compareSnapshot('plan-overview-future-goal-without-steps-error-validation-page')
      })
    })
  })

  describe('Agree plan', () => {
    beforeEach(() => {
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
      cy.compareSnapshot('agree-plan-page')
    })

    it('Agree plan - no options selected error validation', () => {
      cy.get('button').contains('Save').click()
      cy.compareSnapshot('agree-plan-no-options-error-validation-page')
    })

    it('Agree plan - subject does not agree to plan', () => {
      cy.get('#agree-plan-radio-2').click()
      cy.compareSnapshot('agree-plan-no-agreement-page')
    })

    it('Agree plan - subject does not agree to plan error validation', () => {
      cy.get('#agree-plan-radio-2').click()
      cy.get('button').contains('Save').click()
      cy.compareSnapshot('agree-plan-no-agreement-error-validation-page')
    })

    it('Agree plan - subject cannot agree to plan', () => {
      cy.get('#agree-plan-radio-4').click()
      cy.get('button').contains('Save').click()
      cy.compareSnapshot('agree-plan-cannot-agree-page')
    })

    it ('Agree plan - subject cannot agree to plan error validation', () => {
      cy.get('#agree-plan-radio-4').click()
      cy.get('button').contains('Save').click()
      cy.compareSnapshot('agree-plan-cannot-agree-error-validation-page')
    })
  })

  describe('Plan history', () => {
    beforeEach(() => {
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
      cy.contains('a','Plan history').click()
      cy.compareSnapshot('plan-history-page')
    })

    it('Plan history - update goal', () => {
      cy.contains('a','Update').click()
      cy.compareSnapshot('plan-history-update-goal-page')
    })

    it('Plan history - confirm achievement of goal', () => {
      cy.contains('a','Update').click()
      cy.get('button').contains('Mark as achieved').click()
      cy.compareSnapshot('plan-history-confirm-achieved-goal-page')
    })

    it('Plan history - view achieved goal details', () => {
      cy.contains('a','Update').click()
      cy.get('button').contains('Mark as achieved').click()
      cy.get('button').contains('Confirm').click()
      cy.contains('a', 'Achieved goals').click()
      cy.contains('a', 'View details').click()
      cy.compareSnapshot('plan-history-achieved-goal-view-details-page')
    })

    it('Plan history - remove goal from a plan', () => {
      cy.contains('a','Update').click()
      cy.get('button').contains('Remove goal from plan').click()
      cy.compareSnapshot('plan-history-remove-goal-page')
    })

    it('Plan history - remove goal from a plan error validation', () => {
      cy.contains('a','Update').click()
      cy.get('button').contains('Remove goal from plan').click()
      cy.get('button').contains('Confirm').click()
      cy.compareSnapshot('plan-history-remove-goal-error-validation-page')
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
        cy.compareSnapshot('plan-history-remove-goal-view-details-page')
      })

      it('Plan history - confirm adding a removed goal back into the plan', () => {
        cy.contains('a', 'Add to plan').click()
        cy.compareSnapshot('plan-history-add-removed-goal-back-into-plan-page')
      })

      it('Plan history - confirm adding a removed goal back into the plan error validation', () => {
        cy.contains('a', 'Add to plan').click()
        cy.get('button').contains('Confirm').click()
        cy.compareSnapshot('plan-history-add-removed-goal-back-into-plan-error-validation-page')
      })

      it('Plan overview - applying a removed goal as a current goal to the agreed plan', () => {
        cy.contains('a', 'Add to plan').click()
        cy.get('#re-add-goal-reason').type('Subject needs to find a new place to live.')
        cy.get('#start-working-goal-radio').click()
        cy.get('#date-selection-radio').click()
        cy.get('button').contains('Confirm').click()
        cy.compareSnapshot('plan-overview-remove-goal-added-as-current-goal-page')
      })
    })
  })

  describe('Create goal', () => {
    beforeEach(() => {
      cy.contains('a', 'Create goal').click()
    })

    it('Create goal - accommodation', () => {
      cy.compareSnapshot('create-goal-accommodation-page')
    })

    it('Create goal - accommodation error validation', () => {
      cy.get('button').contains('Add steps').click()
      cy.compareSnapshot('create-goal-accommodation-error-validation-page')
    })

    it('Create goal - employment and education', () => {
      cy.get('.moj-side-navigation__list').contains('a', 'Employment and education').click()
      cy.compareSnapshot('create-goal-employment-and-education-page')
    })

    it('Create goal - employment and education error validation', () => {
      cy.get('.moj-side-navigation__list').contains('a', 'Employment and education').click()
      cy.get('button').contains('Add steps').click()
      cy.compareSnapshot('create-goal-employment-and-education-error-validation-page')
    })

    it('Create goal - finances', () => {
      cy.get('.moj-side-navigation__list').contains('a', 'Finances').click()
      cy.compareSnapshot('create-goal-finances-page')
    })

    it('Create goal - finances error validation', () => {
      cy.get('.moj-side-navigation__list').contains('a', 'Finances').click()
      cy.get('button').contains('Add steps').click()
      cy.compareSnapshot('create-goal-finances-error-validation-page')
    })

    it('Create goal - drug use', () => {
      cy.get('.moj-side-navigation__list').contains('a', 'Drug use').click()
      cy.compareSnapshot('create-goal-drug-use-page')
    })

    it('Create goal - drug use error validation', () => {
      cy.get('.moj-side-navigation__list').contains('a', 'Drug use').click()
      cy.get('button').contains('Add steps').click()
      cy.compareSnapshot('create-goal-drug-use-error-validation-page')
    })

    it('Create goal - alcohol use', () => {
      cy.get('.moj-side-navigation__list').contains('a', 'Alcohol use').click()
      cy.compareSnapshot('create-goal-alcohol-use-page')
    })

    it('Create goal - alcohol use error validation', () => {
      cy.get('.moj-side-navigation__list').contains('a', 'Alcohol use').click()
      cy.get('button').contains('Add steps').click()
      cy.compareSnapshot('create-goal-alcohol-use-error-validation-page')
    })

    it('Create goal - health and wellbeing', () => {
      cy.get('.moj-side-navigation__list').contains('a', 'Health and wellbeing').click()
      cy.compareSnapshot('create-goal-health-and-wellbeing-page')
    })

    it('Create goal - health and wellbeing error validation', () => {
      cy.get('.moj-side-navigation__list').contains('a', 'Health and wellbeing').click()
      cy.get('button').contains('Add steps').click()
      cy.compareSnapshot('create-goal-health-and-wellbeing-error-validation-page')
    })

    it('Create goal - personal relationships and community', () => {
      cy.get('.moj-side-navigation__list').contains('a', 'Personal relationships and community').click()
      cy.compareSnapshot('create-goal-personal-relationships-and-community-page')
    })

    it('Create goal - personal relationships and community error validation', () => {
      cy.get('.moj-side-navigation__list').contains('a', 'Personal relationships and community').click()
      cy.get('button').contains('Add steps').click()
      cy.compareSnapshot('create-goal-personal-relationships-and-community-error-validation-page')
    })

    it('Create goal - thinking behaviours and attitude', () => {
      cy.get('.moj-side-navigation__list').contains('a', 'Thinking, behaviours and attitude').click()
      cy.compareSnapshot('create-goal-thinking-behaviours-and-attitude-page')
    })

    it('Create goal - thinking behaviours and attitude error validation', () => {
      cy.get('.moj-side-navigation__list').contains('a', 'Thinking, behaviours and attitude').click()
      cy.get('button').contains('Add steps').click()
      cy.compareSnapshot('create-goal-thinking-behaviours-and-attitude-error-validation-page')
    })
  })

  describe('Add/Change steps', () => {
    beforeEach(() => {
      cy.contains('a', 'Create goal').click()
      cy.get(`#goal-input-autocomplete`).type('Get suitable accommodation')
      cy.get(`#related-area-of-need-radio-2`).click()
      cy.get('#start-working-goal-radio').click()
      cy.get('#date-selection-radio').click()
      cy.get('button').contains('Add steps').click()
    })

    it('Add/Change steps - base', () => {
      cy.compareSnapshot('add-change-steps-page')
    })

    it('Add/Change steps - single step error validation', () => {
      cy.get('button').contains('Save and continue').click()
      cy.compareSnapshot('add-change-steps-single-step-error-validation-page')
    })

    it('Add/Change steps - multiple steps error validation', () => {
      cy.get('button').contains('Add another step').click()
      cy.get('button').contains('Save and continue').click()
      cy.compareSnapshot('add-change-steps-multiple-step-error-validation-page')
    })
  })

  describe('Change goal', () => {
    beforeEach(() => {
      cy.contains('a', 'Create goal').click()
      cy.get(`#goal-input-autocomplete`).type('Get suitable accommodation')
      cy.get(`#related-area-of-need-radio-2`).click()
      cy.get('#start-working-goal-radio-2').click()
      cy.get('button').contains('Save without steps').click()
      cy.contains('a', 'Future goals').click()
      cy.get('a').contains('Change goal').click()
    })

    it('Change goal - base', () => {
      cy.compareSnapshot('change-goal-page')
    })

    it('Change goal - empty field error validation', () => {
      cy.get(`#goal-input-autocomplete`).clear()
      cy.get('button').contains('Save goal').click()
      cy.compareSnapshot('change-goal-error-validation-page')
    })
  })

  describe('Delete goal', () => {
    it('Delete goal - base', () => {
      cy.contains('a', 'Create goal').click()
      cy.get(`#goal-input-autocomplete`).type('Get suitable accommodation')
      cy.get(`#related-area-of-need-radio-2`).click()
      cy.get('#start-working-goal-radio-2').click()
      cy.get('button').contains('Save without steps').click()
      cy.contains('a', 'Future goals').click()
      cy.get('a').contains('Delete').click()
      cy.compareSnapshot('delete-goal-page')
    })
  })
})
