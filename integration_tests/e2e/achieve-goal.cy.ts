import DataGenerator from '../support/DataGenerator'
import { PlanType } from '../../server/@types/PlanType'
import { Goal } from '../../server/@types/GoalType'
import PlanOverview from '../pages/plan-overview'

describe('Achieve goal', () => {
  const planOverview = new PlanOverview()

  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails.plan).as('plan')
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
    })
  })

  describe('Rendering', () => {
    beforeEach(() => {
      cy.get<PlanType>('@plan').then(plan => {
        cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal({})).then(goal => {
          cy.wrap(goal).as('newGoal')
          cy.addStepToGoal(goal.uuid, DataGenerator.generateStep({}))
        })

        planOverview.agreePlan()
        cy.get('a').contains('Mark as achieved').click()
      })
    })

    it('Display agree plan page correctly on load', () => {
      cy.get('h1').contains('has achieved this goal')
      cy.get<Goal>('@newGoal').then(goal => {
        cy.get('.govuk-summary-card__title').should('contain', goal.title)
      })
    })
  })

  describe('Submission behaviour', () => {
    beforeEach(() => {
      cy.get<PlanType>('@plan').then(plan => {
        cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal({})).then(goal => {
          cy.wrap(goal).as('newGoal')
          cy.addStepToGoal(goal.uuid, DataGenerator.generateStep({}))
        })

        planOverview.agreePlan()
        cy.get('a').contains('Mark as achieved').click()
      })
    })

    it('Confirm goal achieved successfully without optional note', () => {
      cy.get('button').contains('Confirm').click()
      cy.url().should('include', '/plan')
      cy.get(':nth-child(3) > .moj-sub-navigation__link')
      cy.get('.moj-sub-navigation__link').eq(2).should('contain', 'Achieved goals (1)')

      cy.get<Goal>('@newGoal').then(goal => {
        cy.visit(`/view-achieved-goal/${goal.uuid}`)
      })
      cy.get('.govuk-body').should('contain', 'Marked as achieved on')
    })

    it('Confirm goal achieved successfully with optional note', () => {
      cy.get('#goal-achievement-helped').type('Some optional text in the achievement note field')
      cy.get('button').contains('Confirm').click()
      cy.url().should('include', '/plan')
      cy.get(':nth-child(3) > .moj-sub-navigation__link')
      cy.get('.moj-sub-navigation__link').eq(2).should('contain', 'Achieved goals (1)')
    })

    it('Cancel goal achieved and redirect successfully', () => {
      cy.get('a').contains('Do not mark as achieved').click()
      cy.url().should('include', '/plan')
      planOverview.getSummaryCard(0).get('a').contains('Mark as achieved')
    })
  })
})
