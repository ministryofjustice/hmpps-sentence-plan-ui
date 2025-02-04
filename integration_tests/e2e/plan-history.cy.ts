import PlanOverview from '../pages/plan-overview'
import DataGenerator from '../support/DataGenerator'
import { AccessMode } from '../../server/@types/Handover'
import AchieveGoal from '../pages/achieve-goal'

describe('Rendering Plan History for READ_WRITE user', () => {
  const planOverview = new PlanOverview()
  const achieveGoal = new AchieveGoal()

  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('plan')
      cy.openSentencePlan(planDetails.oasysAssessmentPk, AccessMode.READ_WRITE)
      cy.addGoalToPlan(planDetails.plan.uuid, DataGenerator.generateGoal()).then(goal => {
        cy.addStepToGoal(goal.uuid, DataGenerator.generateStep())
      })
    })
  })

  it('Plan history link not displayed with no plan agreed - direct access causes 403 forbidden', () => {
    cy.get('.moj-primary-navigation__container').should('not.contain', `Plan history`)
    cy.visit('/plan-history', { failOnStatusCode: false })
    cy.get('.govuk-heading-l').contains('You do not have permission to perform this action')
  })

  it('Display plan history page with plan agreement', () => {
    planOverview.agreePlan()
    cy.get('.moj-primary-navigation__container').contains('Plan history').click()
    cy.get('.plan-history-intro').contains('View all updates and changes made to this plan.')
    cy.get('.plan-status').contains('Plan agreed')
    cy.get('.plan-additional-note').contains('Reason to agree')
    cy.checkAccessibility()
  })

  it('Display plan history page with plan did not agree', () => {
    planOverview.agreePlanDidNotAgree()
    cy.get('.moj-primary-navigation__container').contains('Plan history').click()
    cy.get('.plan-status').contains('Plan created')
    cy.get('.plan-note').contains('Reason to not agree')
    cy.checkAccessibility()
  })

  it('Display plan history page with plan could not agree', () => {
    planOverview.agreePlanCouldNotAgree()
    cy.get('.moj-primary-navigation__container').contains('Plan history').click()
    cy.get('.plan-status').contains('Plan created')
    cy.get('.plan-note').contains('Reason they could not agree')
    cy.checkAccessibility()
  })

  // 1. render goal note for in progress goal: create goal > agree plan > check status update goal > change status
  it('Display plan history page with updated goal status', () => {
    planOverview.agreePlan()
    cy.get('.moj-primary-navigation__container').contains('Plan history').click()
    cy.get('.plan-status').contains('Plan agreed')
    cy.visit('/plan')
    cy.contains('a', 'Update').click() // click update link
    cy.url().should('include', '/update-goal-steps') // check url is update goal
    cy.get('#step-status-1').select('Not started') // select not started status
    cy.get('textarea#more-detail').type('Updated goal to not started')
    cy.get('.govuk-button').contains('Save goal and steps').click()
    cy.url().should('include', '/plan') // check we're back to plan-overview
    cy.get('.govuk-tag').contains('Not started')
    cy.get('.moj-primary-navigation__container').contains('Plan history').click()
    cy.get('.goal-status').contains('Goal updated')
    cy.get('.goal-link').contains('View latest version')
    cy.get('.goal-note').contains('Updated goal to not started')
    cy.checkAccessibility()
  })

  // 2. render goal note for achieved goal: create goal > agree plan > click mark as achieved > add note > click achieved > click plan history link > check values
  it('Display plan history page with achieved goal status', () => {
    planOverview.agreePlan()
    cy.get('.moj-primary-navigation__container').contains('Plan history').click()
    cy.get('.plan-status').contains('Plan agreed')
    cy.visit('/plan')
    cy.contains('a', 'Update').click()
    cy.contains('button', 'Mark as achieved').click()
    cy.url().should('include', '/confirm-if-achieved') // check url
    achieveGoal.isGoalAchievedRadio('yes')
    cy.get('textarea#goal-achievement-helped').type('Updated goal to achieved status')
    cy.get('.govuk-button').contains('Save and continue').click()
    cy.url().should('include', '/plan') // check we're back to plan-overview
    cy.get('.moj-primary-navigation__container').contains('Plan history').click()
    cy.get('.goal-status').contains('Goal marked as achieved')
    cy.get('.goal-link').contains('View goal')
    cy.get('.goal-note').contains('Updated goal to achieved status')
    cy.checkAccessibility()
  })

  // 3. render goal note for removed: create goal > agree plan > click remove > check url contains remove-goal > add note > click confirm > check url contains plan > click plan history > check values
  it('Display plan history page with removed goal status', () => {
    planOverview.agreePlan()
    cy.get('.moj-primary-navigation__container').contains('Plan history').click()
    cy.get('.plan-status').contains('Plan agreed')
    cy.visit('/plan')
    cy.contains('a', 'Update').click()
    cy.contains('button', 'Remove goal from plan').click()
    cy.url().should('include', '/remove-goal')
    cy.get('textarea#goal-removal-note').type('Updated goal to removed status')
    cy.get('.govuk-button').contains('Confirm').click()
    cy.url().should('include', '/plan')
    cy.get('.moj-primary-navigation__container').contains('Plan history').click()
    cy.get('.goal-status').contains('Goal removed')
    cy.get('.goal-link').contains('View goal')
    cy.get('.goal-note').contains('Updated goal to removed status')
    cy.checkAccessibility()
  })
})

describe('Rendering Plan History for READ_ONLY user', () => {
  const planOverview = new PlanOverview()
  const achieveGoal = new AchieveGoal()

  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('plan')
      cy.openSentencePlan(planDetails.oasysAssessmentPk, AccessMode.READ_WRITE)
      cy.addGoalToPlan(planDetails.plan.uuid, DataGenerator.generateGoal()).then(goal => {
        cy.addStepToGoal(goal.uuid, DataGenerator.generateStep())
      })
      // We need to agree plan and mark goal as achieved before switching to READ_ONLY
      planOverview.agreePlan()
      cy.get('.moj-primary-navigation__container').contains('Plan history').click()
      cy.get('.plan-status').contains('Plan agreed')
      cy.visit('/plan')
      cy.contains('a', 'Update').click()
      cy.contains('button', 'Mark as achieved').click()
      cy.url().should('include', '/confirm-if-achieved') // check url
      achieveGoal.isGoalAchievedRadio('yes')
      cy.get('textarea#goal-achievement-helped').type('Updated goal to achieved status')
      cy.get('.govuk-button').contains('Save and continue').click()
      cy.url().should('include', '/plan') // check we're back to plan-overview

      cy.openSentencePlan(planDetails.oasysAssessmentPk, AccessMode.READ_ONLY)
    })
  })

  it('Display plan history page with plan agreement', () => {
    cy.get('.moj-primary-navigation__container').contains('Plan history').click()
    cy.get('.plan-history-intro').contains('View all updates and changes made to this plan.')
    cy.get('.plan-status').contains('Plan agreed')
    cy.get('.plan-additional-note').contains('Reason to agree')
    cy.checkAccessibility()
  })

  it('Display plan history page with achieved goal status', () => {
    cy.get('.moj-primary-navigation__container').contains('Plan history').click()
    cy.get('.goal-status').contains('Goal marked as achieved')
    cy.get('.goal-link').should('not.exist')
    cy.get('.goal-note').contains('Updated goal to achieved status')
    cy.checkAccessibility()
  })
})
