import DataGenerator from '../support/DataGenerator'
import { PlanType } from '../../server/@types/PlanType'
import PlanSummary from '../pages/plan-summary'
import { NewGoal } from '../../server/@types/NewGoalType'

describe('Achieve goal', () => {
  const planSummary = new PlanSummary()

  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('plan')
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
    })
  })

  describe('Rendering', () => {
    beforeEach(() => {
      cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
        cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal()).then(goal => {
          cy.wrap(goal).as('newGoal')
          cy.addStepToGoal(goal.uuid, DataGenerator.generateStep())
        })

        planSummary.agreePlan()
        cy.get('a').contains('Mark as achieved').click()
      })
    })

    it('Display agree plan page correctly on load', function () {
      console.log(this.newGoal)
      cy.get('h1').contains('has achieved this goal')
      cy.get('.govuk-summary-card__title').should('contain', this.newGoal.title)
    })
  })

  describe('Submission behaviour', () => {
    beforeEach(() => {
      cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
        cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal()).then(goal => {
          cy.wrap(goal).as('newGoal')
          cy.addStepToGoal(goal.uuid, DataGenerator.generateStep())
        })

        planSummary.agreePlan()
        cy.get('a').contains('Mark as achieved').click()
      })
    })

    it('Confirm goal achieved successfully without optional note', () => {
      cy.get('button').contains('Confirm').click()
      cy.url().should('include', '/view-achieved-goal')
      cy.get('.govuk-body-s').should('contain', 'Marked as achieved on')

      cy.visit('/plan-summary')
      cy.get(':nth-child(3) > .moj-sub-navigation__link')
      cy.get('.moj-sub-navigation__link').eq(2).should('contain', 'Achieved goals (1)')
    })

    it('Confirm goal achieved successfully with optional note', () => {
      cy.get('#goal-achievement-helped').type('Some optional text in the achievement note field')
      cy.get('button').contains('Confirm').click()
      cy.url().should('include', '/view-achieved-goal')

      cy.visit('/plan-summary')
      cy.get(':nth-child(3) > .moj-sub-navigation__link')
      cy.get('.moj-sub-navigation__link').eq(2).should('contain', 'Achieved goals (1)')
    })

    it('Cancel goal achieved and redirect successfully', () => {
      cy.get('a').contains('Do not mark as achieved').click()
      cy.url().should('include', '/plan-summary')
      planSummary.getSummaryCard(0).get('a').contains('Mark as achieved')
    })
  })
})
