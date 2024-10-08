import PlanSummary from '../pages/plan-summary'
import { PlanType } from '../../server/@types/PlanType'
import DataGenerator from '../support/DataGenerator'

describe('View Plan Summary', () => {
  const planSummary = new PlanSummary()

  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('plan')
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
    })
  })

  it('Should have a Create goal button and it should take to create goal', () => {
    cy.visit('/plan-summary')
    cy.contains('a', 'Create goal').click()
    cy.url().should('include', '/create-goal/')
  })

  it('Should have a `Return to OASys` button and it should return the user to the OASys return URL', () => {
    cy.contains('a', 'Return to OASys').should('have.attr', 'href').and('include', 'https://oasys-url')
  })

  it('Should have text saying no goals to work on now', () => {
    cy.visit('/plan-summary')
    cy.get('.govuk-grid-column-full').should('contain', 'does not have any goals to work on now. You can either:')
  })

  it('Should have text saying no future goals present', () => {
    cy.visit('/plan-summary')
    cy.get('.moj-sub-navigation__link').contains('Future goals').click()
    cy.get('.govuk-grid-column-full').should('contain', 'does not have any future goals in their plan')
  })

  it('Should result in error when agree plan without goals', () => {
    cy.visit('/plan-summary')
    cy.get('button').contains('Agree plan').click()
    cy.title().should('contain', 'Error:')
    cy.get('.govuk-error-summary').should('contain', 'You must add steps to the goals Sam is working on now')
  })

  it('Plan with goals and no steps should result into error when Agree plan', () => {
    cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
      cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal({ title: 'Test Accommodation' }))
      cy.visit('/plan-summary?source=nav')
    })

    cy.get('button').contains('Agree plan').click()
    cy.title().should('contain', 'Error:')
    cy.get('.govuk-error-summary').should('contain', 'You must add steps to the goals Sam is working on now')
  })

  it('Plan with goals and no steps should have Add steps link and takes to takes to add-steps page', () => {
    cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
      cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal({ title: 'Test Accommodation' }))
      cy.visit('/plan-summary?source=nav')
    })
    cy.contains('a', 'Add steps').click()
    cy.url().should('include', '/add-steps')
  })

  it('Plan with goals and steps should have required links and status as not started', () => {
    cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
      cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal({ title: 'Test Accommodation' }))
      cy.visit('/plan-summary?source=nav')
    })
    cy.contains('a', 'Add steps').click()
    cy.get('#step-description-1-autocomplete').type('Accommodation')

    cy.get('button').contains('Save and continue').click()
    cy.url().should('include', '/plan-summary?status=success')
    cy.get('.goal-summary-card')
    cy.contains('.goal-summary-card', 'Accommodation').within(() => {
      cy.contains('a', 'Change goal')
      cy.contains('a', 'Add or change steps')
      cy.contains('a', 'Remove goal')
      cy.get('.govuk-tag').contains('Not started')
    })
  })

  it('Plan with valid goals and steps should go to agree-plan', () => {
    cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
      cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal({ title: 'Test Accommodation' }))
      cy.visit('/plan-summary?source=nav')
    })
    cy.contains('a', 'Add steps').click()
    cy.get(`#step-description-1-autocomplete`).type('Accommodation')

    cy.get('button').contains('Save and continue').click()
    cy.get('button').contains('Agree plan').click()
    cy.url().should('include', '/agree-plan')
  })

  it('Creates three new goals, and moves the middle goal up', () => {
    cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
      ;[1, 2, 3].forEach(i => {
        cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal({ title: `Test Accommodation ${i}` }))
      })
      cy.visit('/plan-summary?source=nav')
    })

    planSummary.clickUpOnSummaryCard(1)

    planSummary
      .getSummaryCard(0)
      .should('contain', 'Test Accommodation 2')
      .and('contain', 'Move goal down')
      .and('not.contain', 'Move goal up')
    planSummary
      .getSummaryCard(1)
      .should('contain', 'Test Accommodation 1')
      .and('contain', 'Move goal down')
      .and('contain', 'Move goal up')
  })

  it('Creates three new goals, and moves the middle goal down', () => {
    cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
      ;[1, 2, 3].forEach(i => {
        cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal({ title: `Test Accommodation ${i}` }))
      })
      cy.visit('/plan-summary?source=nav')
    })

    planSummary.clickDownOnSummaryCard(1)

    planSummary
      .getSummaryCard(1)
      .should('contain', 'Test Accommodation 3')
      .and('contain', 'Move goal down')
      .and('contain', 'Move goal up')
    planSummary
      .getSummaryCard(2)
      .should('contain', 'Test Accommodation 2')
      .and('contain', 'Move goal up')
      .and('not.contain', 'Move goal down')
  })

  it.skip('Should have no accessibility violations', () => {
    cy.checkAccessibility()
  })
})
