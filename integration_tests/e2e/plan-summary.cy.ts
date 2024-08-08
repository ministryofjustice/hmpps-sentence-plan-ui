import CreateGoal from '../pages/create-goal'
import PlanSummary from '../pages/plan-summary'

describe('View Plan Summary', () => {
  const planSummary = new PlanSummary()
  const createGoalPage = new CreateGoal()

  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('planDetails')
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
      cy.visit('/plan-summary?source=nav')
    })
  })

  it('Creates three new goals, and moves the middle goal up', () => {
    createGoalPage.createCompleteGoal(0)
    createGoalPage.createCompleteGoal(1)
    createGoalPage.createCompleteGoal(2)
    planSummary.clickUpOnSummaryCard(1)

    planSummary
      .getSummaryCard(0)
      .should('contain', 'Accommodation Goal 2')
      .and('contain', 'Move goal down')
      .and('not.contain', 'Move goal up')
    planSummary
      .getSummaryCard(1)
      .should('contain', 'Accommodation Goal 1')
      .and('contain', 'Move goal down')
      .and('contain', 'Move goal up')
  })

  it('Creates three new goals, and moves the middle goal down', () => {
    createGoalPage.createCompleteGoal(0)
    createGoalPage.createCompleteGoal(1)
    createGoalPage.createCompleteGoal(2)
    planSummary.clickDownOnSummaryCard(1)

    planSummary
      .getSummaryCard(1)
      .should('contain', 'Accommodation Goal 3')
      .and('contain', 'Move goal down')
      .and('contain', 'Move goal up')
    planSummary
      .getSummaryCard(2)
      .should('contain', 'Accommodation Goal 2')
      .and('contain', 'Move goal up')
      .and('not.contain', 'Move goal down')
  })

  it('Adds a long goal title (less than 128 chars)', () => {
    createGoalPage.createGoal('accommodation')
    createGoalPage.addGoalAutoCompletionText(
      'This is an example of an extremely long goal title, a goal title that some may say is too long. This goal is far longer.',
    )
    createGoalPage.selectOtherAreasOfNeedRadio('no')
    createGoalPage.selectStartWorkingRadio('yes')
    createGoalPage.selectAchievementDate('In 6 months')
    createGoalPage.clickButton('Save without steps')

    planSummary.getSummaryCard(0).within(() => {
      cy.get('.govuk-summary-card__action').first().invoke('height').should('equal', 25)
    })
  })

  it.skip('Should have no accessibility violations', () => {
    cy.checkAccessibility()
  })
})
