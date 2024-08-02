describe('Create a new Goal', () => {
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('plan')
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
    })
  })

  it('Creates a new goal with steps', () => {
    cy.createGoal('accommodation')
    cy.selectGoalAutocompleteOption('acc', 0)
    cy.selectOtherAreasOfNeedRadio('yes')
    cy.selectOtherAreasOfNeed(['Employment and education', 'Drug use'])
    cy.selectStartWorkingRadio('yes')
    cy.selectAchievementDate('In 6 months')
    cy.clickButton('Add steps')
    cy.url().should('include', '/steps/create')
    cy.get('#step-name').click()
    cy.get('#step-name').type('This is the first step')
    cy.get('#actor').click()
    cy.get('#actor-2').click()
    cy.clickButton('Save and continue')

    cy.url().should('include', '/plan-summary')
  })

  it('Creates a new goal with errors', () => {
    cy.createGoal('accommodation')
    cy.selectGoalAutocompleteOption('acc', 0)
    cy.selectStartWorkingRadio('yes')
    cy.selectAchievementDateSomethingElse('{backspace}')
    cy.clickButton('Add steps')

    cy.url().should('include', '/create-goal/accommodation')
    cy.get('.govuk-error-summary')
      .should('contain', 'Select yes if this goal is related to any other area of need')
      .should('contain', 'Select a date')
    cy.contains('#other-area-of-need-radio-error', 'Select yes if this goal is related to any other area of need')
    cy.contains('.hmpps-datepicker', 'Select a date')
    cy.title().should('contain', 'Error:')
  })

  it('Creates a new goal without steps', () => {
    cy.createGoal('accommodation')
    cy.selectGoalAutocompleteOption('acc', 0)
    cy.selectOtherAreasOfNeedRadio('yes')
    cy.selectOtherAreasOfNeed(['Employment and education', 'Drug use'])
    cy.selectStartWorkingRadio('yes')
    cy.selectAchievementDate('In 6 months')
    cy.clickButton('Save without steps')

    cy.url().should('include', '/plan-summary')
  })
})
