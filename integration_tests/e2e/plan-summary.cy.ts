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

  it('Creates three new goals, and moves the middle goal up', () => {
    cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
      ;[1, 2, 3].forEach(i => {
        cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoalWithTitle(`Test Accommodation ${i}`))
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
        cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoalWithTitle(`Test Accommodation ${i}`))
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

  it('Adds a long goal title (less than 128 chars)', () => {
    cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
      cy.addGoalToPlan(
        plan.uuid,
        DataGenerator.generateGoalWithTitle(
          'This is an example of an extremely long goal title, a goal title that some may say is too long. This goal is far longer.',
        ),
      )
      cy.visit('/plan-summary?source=nav')
    })

    planSummary.getSummaryCard(0).within(() => {
      cy.get('.govuk-summary-card__action')
        .contains('Change goal')
        .then($el => $el.position().top)
        .then(firstTop => {
          cy.get('.govuk-summary-card__action')
            .contains('Remove goal')
            .then($el => $el.position().top)
            .then(lastTop => {
              expect(firstTop).to.be.equal(lastTop)
            })
        })
    })
  })

  it.skip('Should have no accessibility violations', () => {
    cy.checkAccessibility()
  })
})
