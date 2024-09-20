import DataGenerator from '../support/DataGenerator'
import { PlanType } from '../../server/@types/PlanType'
import PlanSummary from '../pages/plan-summary'

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
          cy.addStepToGoal(goal.uuid, DataGenerator.generateStep())
        })

        planSummary.agreePlan()
        cy.get('a').contains('Mark as achieved').click()
      })
    })

    it('Display agree plan page correctly on load', () => {
      cy.get('h1').contains('has achieved this goal')
      // cy.get('.govuk-label').contains('Yes')
      // cy.get('.govuk-label').contains('No')
      // cy.get('.govuk-label').contains('could not answer this question')
      // cy.get('.govuk-label').contains('Add any notes (optional)')
      // cy.get('.govuk-button').contains('Agree plan with')
    })
  })

  // describe('Submission behaviour', () => {
  //   beforeEach(() => {
  //     cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
  //       cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal()).then(goal => {
  //         cy.addStepToGoal(goal.uuid, DataGenerator.generateStep())
  //       })
  //
  //       cy.visit(`/agree-plan`)
  //     })
  //   })
  //
  //   it('Submit successfully when Yes is selected and additional notes provided', () => {
  //     cy.get('#agree-plan-radio').click()
  //     cy.get('#notes').type('abc')
  //
  //     cy.get('.govuk-button').click()
  //
  //     cy.url().should('include', '/plan-summary')
  //   })
  //   it('Submit successfully when No is selected and additional information provided', () => {
  //     cy.get('#agree-plan-radio-2').click()
  //     cy.get('#does-not-agree-details').type('abc')
  //
  //     cy.get('.govuk-button').click()
  //
  //     cy.url().should('include', '/plan-summary')
  //   })
  //   it('Submit successfully when "Could not answer this question" is selected and additional information provided', () => {
  //     cy.get('#agree-plan-radio-3').click()
  //     cy.get('#could-not-answer-details').type('abc')
  //
  //     cy.get('.govuk-button').click()
  //
  //     cy.url().should('include', '/plan-summary')
  //   })
  // })
})
