describe('Visual comparison testing', () => {
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
      cy.visit('/plan')
    })
  })

  describe('About', () => {
    it('About - base screenshot', () => {
      cy.get('.moj-primary-navigation__container').contains('a', 'About').click()
      cy.compareSnapshot('about-page')
    })
  })

  describe('Plan overview', () => {
    describe('Base state', () => {
      it('Plan overview - base screenshot', () => {
        cy.compareSnapshot('plan-overview-page')
      })

      it('Plan overview - base error validation screenshot', () => {
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

      it('Plan overview - current goal without steps screenshot', () => {
        cy.compareSnapshot('plan-overview-current-goal-without-steps-page')
      })

      it('Plan overview - current goal without steps error validation screenshot', () => {
        cy.get('button').contains('Agree plan').click()
        cy.compareSnapshot('plan-overview-current-goal-without-steps-error-validation-page')
      })
    })

    describe('Current goal with steps', () => {
      it('Plan overview - current goal with steps screenshot', () => {
        cy.contains('a', 'Create goal').click()
        cy.get(`#goal-input-autocomplete`).type('Get suitable accommodation')
        cy.get(`#related-area-of-need-radio-2`).click()
        cy.get('#start-working-goal-radio').click()
        cy.get('#date-selection-radio').click()
        cy.get('button').contains('Add steps').click()
        cy.get('#step-actor-1').select('Probation practitioner')
        cy.get(`#step-description-1`).type('Check that the subject is adhering to a lease agreement')
        cy.get('button').contains('Save and continue').click()
        cy.compareSnapshot('plan-overview-current-goal-with-steps-page')
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

      it('Plan overview - future goal with steps error validation screenshot', () => {
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

      it('Plan overview - future goal without steps screenshot', () => {
        cy.contains('a', 'Future goals').click()
        cy.compareSnapshot('plan-overview-future-goal-without-steps-page')
      })

      it('Plan overview - future goal without steps error validation screenshot', () => {
        cy.get('button').contains('Agree plan').click()
        cy.compareSnapshot('plan-overview-future-goal-without-steps-error-validation-page')
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

      it('Agree plan - base screenshot', () => {
        cy.compareSnapshot('agree-plan-page')
      })

      it('Agree plan - no options selected error validation screenshot', () => {
        cy.get('button').contains('Save').click()
        cy.compareSnapshot('agree-plan-error-validation-page')
      })
    })
  })

  describe('Create goal', () => {
    beforeEach(() => {
      cy.contains('a', 'Create goal').click()
    })

    it('Create goal - accommodation screenshot', () => {
      cy.compareSnapshot('create-goal-accommodation-page')
    })

    it('Create goal - accommodation error validation screenshot', () => {
      cy.get('button').contains('Add steps').click()
      cy.compareSnapshot('create-goal-accommodation-error-validation-page')
    })

    it('Create goal - employment and education screenshot', () => {
      cy.get('.moj-side-navigation__list').contains('a', 'Employment and education').click()
      cy.compareSnapshot('create-goal-employment-and-education-page')
    })

    it('Create goal - employment and education error validation screenshot', () => {
      cy.get('.moj-side-navigation__list').contains('a', 'Employment and education').click()
      cy.get('button').contains('Add steps').click()
      cy.compareSnapshot('create-goal-employment-and-education-error-validation-page')
    })

    it('Create goal - finances screenshot', () => {
      cy.get('.moj-side-navigation__list').contains('a', 'Finances').click()
      cy.compareSnapshot('create-goal-finances-page')
    })

    it('Create goal - finances error validation screenshot', () => {
      cy.get('.moj-side-navigation__list').contains('a', 'Finances').click()
      cy.get('button').contains('Add steps').click()
      cy.compareSnapshot('create-goal-finances-error-validation-page')
    })

    it('Create goal - drug use screenshot', () => {
      cy.get('.moj-side-navigation__list').contains('a', 'Drug use').click()
      cy.compareSnapshot('create-goal-drug-use-page')
    })

    it('Create goal - drug use error validation screenshot', () => {
      cy.get('.moj-side-navigation__list').contains('a', 'Drug use').click()
      cy.get('button').contains('Add steps').click()
      cy.compareSnapshot('create-goal-drug-use-error-validation-page')
    })

    it('Create goal - alcohol use screenshot', () => {
      cy.get('.moj-side-navigation__list').contains('a', 'Alcohol use').click()
      cy.compareSnapshot('create-goal-alcohol-use-page')
    })

    it('Create goal - alcohol use error validation screenshot', () => {
      cy.get('.moj-side-navigation__list').contains('a', 'Alcohol use').click()
      cy.get('button').contains('Add steps').click()
      cy.compareSnapshot('create-goal-alcohol-use-error-validation-page')
    })

    it('Create goal - health and wellbeing screenshot', () => {
      cy.get('.moj-side-navigation__list').contains('a', 'Health and wellbeing').click()
      cy.compareSnapshot('create-goal-health-and-wellbeing-page')
    })

    it('Create goal - health and wellbeing error validation screenshot', () => {
      cy.get('.moj-side-navigation__list').contains('a', 'Health and wellbeing').click()
      cy.get('button').contains('Add steps').click()
      cy.compareSnapshot('create-goal-health-and-wellbeing-error-validation-page')
    })

    it('Create goal - personal relationships and community screenshot', () => {
      cy.get('.moj-side-navigation__list').contains('a', 'Personal relationships and community').click()
      cy.compareSnapshot('create-goal-personal-relationships-and-community-page')
    })

    it('Create goal - personal relationships and community error validation screenshot', () => {
      cy.get('.moj-side-navigation__list').contains('a', 'Personal relationships and community').click()
      cy.get('button').contains('Add steps').click()
      cy.compareSnapshot('create-goal-personal-relationships-and-community-error-validation-page')
    })

    it('Create goal - thinking behaviours and attitude screenshot', () => {
      cy.get('.moj-side-navigation__list').contains('a', 'Thinking, behaviours and attitude').click()
      cy.compareSnapshot('create-goal-thinking-behaviours-and-attitude-page')
    })

    it('Create goal - thinking behaviours and attitude error validation screenshot', () => {
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

    it('Add/Change steps - base screenshot', () => {
      cy.compareSnapshot('add-change-steps-page')
    })

    it('Add/Change steps - single step error validation screenshot', () => {
      cy.get('button').contains('Save and continue').click()
      cy.compareSnapshot('add-change-steps-single-step-error-validation-page')
    })

    it('Add/Change steps - multiple steps error validation screenshot', () => {
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

    it('Change goal - base screenshot', () => {
      cy.compareSnapshot('change-goal-page')
    })

    it('Change goal - empty field error validation screenshot', () => {
      cy.get(`#goal-input-autocomplete`).clear()
      cy.get('button').contains('Save goal').click()
      cy.compareSnapshot('change-goal-error-validation-page')
    })
  })

  describe('Delete goal', () => {
    it('Delete goal - base screenshot', () => {
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

  // describe('Plan History', () => {
  //   it('take plan history page screenshot', () => {
  //     cy.visit('/plan-history')
  //     cy.compareSnapshot('plan-history-page')
  //   })
  // })
})
