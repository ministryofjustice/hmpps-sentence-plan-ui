import { AccessMode } from '../../server/@types/Handover'
import DataGenerator from '../support/DataGenerator'
import { PlanType } from '../../server/@types/PlanType'

describe('View Plan Overview for READ_ONLY user', () => {
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.openSentencePlan(planDetails.oasysAssessmentPk, AccessMode.READ_ONLY)
    })
  })

  it('Should have one button', () => {
    cy.visit('/plan')
    cy.get('button').should('have.length', 0)
    cy.get('[role="button"]').should('have.length', 1).and('contain', 'Return to OASys')
  })

  it('Visiting create-goal should fail', () => {
    cy.visit('/create-goal/accommodation', { failOnStatusCode: false })
    cy.url().should('not.include', '/plan')
  })

  it('Should have a `Return to OASys` button and it should return the user to the OASys return URL', () => {
    cy.contains('a', 'Return to OASys').should('have.attr', 'href').and('include', Cypress.env('OASTUB_URL'))
  })

  it.skip('Should have no accessibility violations', () => {
    cy.checkAccessibility()
  })
})

describe('View specific plan version for READ_ONLY user', () => {
  let pk

  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('plan')
      pk = planDetails.oasysAssessmentPk
      cy.addGoalToPlan(planDetails.plan.uuid, DataGenerator.generateGoal()).then(goal => {
        cy.addStepToGoal(goal.uuid, DataGenerator.generateStep())
      })
      cy.lockPlan(planDetails.plan.uuid)
    })
  })

  it('Should have one button', () => {
    cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
      cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal()).then(goal => {
        cy.addStepToGoal(goal.uuid, DataGenerator.generateStep())
      })

      cy.openSentencePlan(pk, AccessMode.READ_ONLY, 0)
      cy.url().should('include', '/plan')
      // // assert 1 goal card
      //
      // then open sentence plan v2
      // /;assert 2 goal cards
    })
  })
})
