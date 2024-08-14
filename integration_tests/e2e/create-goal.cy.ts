import CreateGoal from '../pages/create-goal'
import AddSteps from '../pages/add-steps'

describe('Create a new Goal', () => {
  const createGoalPage = new CreateGoal()
  const addStep = new AddSteps()

  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('planDetails')
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
      cy.visit('/about-pop')
    })
  })

  it('Creates a new goal with steps', () => {
    createGoalPage.createGoal('accommodation')
    createGoalPage.selectGoalAutocompleteOption('acc', 0)
    createGoalPage.selectOtherAreasOfNeedRadio('yes')
    createGoalPage.selectOtherAreasOfNeed(['Employment and education', 'Drug use'])
    createGoalPage.selectStartWorkingRadio('yes')
    createGoalPage.selectAchievementDate('In 6 months')
    createGoalPage.clickButton('Add steps')

    cy.url().should('include', '/steps/create')
    addStep.addStepAutocompleteText('This is the first step')
    addStep.selectStepActors(['Sam', 'Probation practitioner'])
    addStep.saveAndContinue()

    cy.url().should('include', '/plan-summary')
  })

  it('Creates a new goal with errors', () => {
    createGoalPage.createGoal('accommodation')
    createGoalPage.selectGoalAutocompleteOption('acc', 0)
    createGoalPage.selectStartWorkingRadio('yes')
    createGoalPage.selectAchievementDateSomethingElse('{backspace}')
    createGoalPage.clickButton('Add steps')

    cy.url().should('include', '/create-goal/accommodation')
    cy.get('.govuk-error-summary')
      .should('contain', 'Select yes if this goal is related to any other area of need')
      .should('contain', 'Select a date')
    cy.contains('#related-area-of-need-radio-error', 'Select yes if this goal is related to any other area of need')
    cy.contains('.hmpps-datepicker', 'Select a date')
    cy.title().should('contain', 'Error:')
  })

  it('Creates a new goal without steps', () => {
    createGoalPage.createGoal('accommodation')
    createGoalPage.selectGoalAutocompleteOption('acc', 0)
    createGoalPage.selectOtherAreasOfNeedRadio('yes')
    createGoalPage.selectOtherAreasOfNeed(['Employment and education', 'Drug use'])
    createGoalPage.selectStartWorkingRadio('yes')
    createGoalPage.selectAchievementDate('In 6 months')
    createGoalPage.clickButton('Save without steps')

    cy.url().should('include', '/plan-summary')
  })

  it.skip('Should have no accessibility violations', () => {
    cy.checkAccessibility()
  })
})
