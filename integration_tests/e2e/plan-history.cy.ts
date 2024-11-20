import PlanOverview from '../pages/plan-overview'
import DataGenerator from '../support/DataGenerator'

describe('Rendering', () => {
  const planOverview = new PlanOverview()

  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('plan')
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
      cy.addGoalToPlan(planDetails.plan.uuid, DataGenerator.generateGoal()).then(goal => {
        cy.addStepToGoal(goal.uuid, DataGenerator.generateStep())
      })
    })
  })

  it('Display plan history page correctly on load with no plan agreed', () => {
    cy.get('.moj-primary-navigation__container').contains('Plan history').click()
    cy.get('h1').contains('Plan history')
    cy.get('.plan-history-intro').should('include.text', "plan has been agreed, you'll be able to view updates here.")
  })

  it('Display plan history page with plan agreement', () => {
    planOverview.agreePlan()
    cy.get('.moj-primary-navigation__container').contains('Plan history').click()
    cy.get('.plan-history-intro').contains('View all updates and changes made to this plan.')
    cy.get('.plan-status').contains('Plan agreed')
    cy.get('.plan-additional-note').contains('Reason to agree')
  })

  it('Display plan history page with plan did not agree', () => {
    planOverview.agreePlanDidNotAgree()
    cy.get('.moj-primary-navigation__container').contains('Plan history').click()
    cy.get('.plan-status').contains('Plan created')
    cy.get('.plan-note').contains('Reason to not agree')
  })

  it('Display plan history page with plan could not agree', () => {
    planOverview.agreePlanCouldNotAgree()
    cy.get('.moj-primary-navigation__container').contains('Plan history').click()
    cy.get('.plan-status').contains('Plan created')
    cy.get('.plan-note').contains('Reason they could not agree')
  })

  // 1. render goal note for in progress goal: create goal > agree plan > check status update goal > change status
  it('Display plan history page with updated goal status', () => {
    planOverview.agreePlan()
    cy.get('.moj-primary-navigation__container').contains('Plan history').click()
    cy.get('.plan-status').contains('Plan agreed')
    cy.visit('/plan')
    cy.contains('a', 'Update').click() // click update link
    cy.url().should('include', '/update-goal') // check url is update goal
    cy.get('#step-status-1').select('Not started') // select not started status
    cy.get('textarea#more-detail').type('Updated goal to not started')
    cy.get('.govuk-button').contains('Save goal and steps').click()
    cy.url().should('include', '/plan') // check we're back to plan-overview
    cy.get('.govuk-tag').contains('Not started')
    cy.get('.moj-primary-navigation__container').contains('Plan history').click()
    cy.get('.goal-status').contains('Goal updated')
    cy.get('.goal-note').contains('Updated goal to not started')
  })

  // 2. render goal note for achieved goal: create goal > agree plan > click mark as achieved > add note > click achieved > click plan history link > check values
  it('Display plan history page with achieved goal status', () => {
    planOverview.agreePlan()
    cy.get('.moj-primary-navigation__container').contains('Plan history').click()
    cy.get('.plan-status').contains('Plan agreed')
    cy.visit('/plan')
    cy.contains('a', 'Mark as achieved').click()
    cy.url().should('include', '/confirm-achieved-goal') // check url
    cy.get('textarea#goal-achievement-helped').type('Updated goal to achieved status')
    cy.get('.govuk-button').contains('Confirm').click()
    cy.url().should('include', '/plan') // check we're back to plan-overview
    cy.get('.moj-primary-navigation__container').contains('Plan history').click()
    cy.get('.goal-status').contains('Goal marked as achieved')
    cy.get('.goal-note').contains('Updated goal to achieved status')
  })

  // 3. render goal note for removed: create goal > agree plan > click remove > check url contains remove-goal > add note > click confirm > check url contains plan > click plan history > check values
  it('Display plan history page with removed goal status', () => {
    planOverview.agreePlan()
    cy.get('.moj-primary-navigation__container').contains('Plan history').click()
    cy.get('.plan-status').contains('Plan agreed')
    cy.visit('/plan')
    cy.contains('a', 'Remove').click()
    cy.url().should('include', '/remove-goal')
    cy.get('textarea#goal-removal-note').type('Updated goal to removed status')
    cy.get('.govuk-button').contains('Confirm').click()
    cy.url().should('include', '/plan')
    cy.get('.moj-primary-navigation__container').contains('Plan history').click()
    cy.get('.goal-status').contains('Goal removed')
    cy.get('.goal-note').contains('Updated goal to removed status')
  })
})
