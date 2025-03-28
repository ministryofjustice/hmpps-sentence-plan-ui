import DataGenerator from '../support/DataGenerator'
import { PlanType } from '../../server/@types/PlanType'
import { Goal } from '../../server/@types/GoalType'
import PlanOverview from '../pages/plan-overview'
import IntegrationUtils from '../integrationUtils'
import { AccessMode } from '../../server/@types/Handover'

describe('Achieve goal', () => {
  const planOverview = new PlanOverview()
  const integrationUtils = new IntegrationUtils()

  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails.plan).as('plan')
      cy.wrap(planDetails.oasysAssessmentPk).as('oasysAssessmentPk')
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
    })
  })

  describe('Security', () => {
    beforeEach(() => {
      cy.get<PlanType>('@plan').then(plan => {
        cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal({})).then(goal => {
          cy.wrap(goal).as('newGoal')
          cy.addStepToGoal(goal.uuid, DataGenerator.generateStep({}))
        })

        planOverview.agreePlan()
      })
    })

    it('Should display authorisation error if user does not have READ_WRITE role', () => {
      cy.get<string>('@oasysAssessmentPk').then(oasysAssessmentPk => {
        cy.openSentencePlan(oasysAssessmentPk, { accessMode: AccessMode.READ_ONLY })
      })

      cy.get<Goal>('@newGoal').then(goal => {
        cy.visit(`/confirm-achieved-goal/${goal.uuid}`, { failOnStatusCode: false })
        cy.get('.govuk-body').should('contain', 'You do not have permission to perform this action')
      })

      cy.checkAccessibility(true, ['scrollable-region-focusable'])
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
      })
    })

    it('Displays agree plan page correctly on load', () => {
      cy.get<Goal>('@newGoal').then(goal => {
        cy.visit(`/confirm-achieved-goal/${goal.uuid}`)
        cy.get('h1').contains('has achieved this goal')
        cy.get('.govuk-summary-card__title').should('contain', goal.title)
      })
      cy.checkAccessibility()
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
        cy.get<Goal>('@newGoal').then(goal => {
          cy.visit(`/update-goal-steps/${goal.uuid}`)
          cy.get('button').contains('Mark as achieved').click()
        })
      })
    })

    it('Confirm goal achieved successfully without optional note', () => {
      cy.get('button').contains('Confirm').click()
      cy.url().should('include', 'plan?type=achieved&status=achieved')
      cy.get('.moj-sub-navigation__link').eq(2).should('contain', 'Achieved goals (1)')
      cy.get('.govuk-summary-card').should('contain', 'Marked as achieved on')

      cy.get<Goal>('@newGoal').then(goal => {
        cy.visit(`/view-achieved-goal/${goal.uuid}`)
      })
      cy.get('.govuk-body').should('contain', 'Marked as achieved on')
      cy.checkAccessibility()
    })

    it('Confirm goal achieved successfully with optional note', () => {
      cy.get('#goal-achievement-helped').type('Some optional text in the achievement note field')
      cy.get('button').contains('Confirm').click()
      cy.url().should('include', 'plan?type=achieved&status=achieved')
      cy.get(':nth-child(3) > .moj-sub-navigation__link')
      cy.get('.moj-sub-navigation__link').eq(2).should('contain', 'Achieved goals (1)')

      cy.get('.moj-sub-navigation__link').eq(2).click()
      planOverview.getSummaryCard(0).get('a').contains('View details').click()
      cy.get('.govuk-details__text').should('contain', 'Some optional text in the achievement note field')
      cy.get('p.govuk-body').should('contain', 'Marked as achieved on ')
      cy.get('a.govuk-back-link').should('have.attr', 'href').and('include', '/plan?type=achieved')
      cy.get('.govuk-button--secondary').should('have.length', 0)
      cy.checkAccessibility()
    })

    it('Confirm errors are displayed with optional note of more than 4000 characters', () => {
      const lorem = integrationUtils.generateStringOfLength(4001)
      cy.get('#goal-achievement-helped').invoke('val', lorem)
      cy.get('button').contains('Confirm').click()
      cy.url().should('include', '/confirm-achieved-goal/')
      cy.get('.govuk-error-summary').should(
        'contain',
        'How achieving this goal has helped must be 4,000 characters or less',
      )
      cy.get('#goal-achievement-helped-error').should(
        'contain',
        'How achieving this goal has helped must be 4,000 characters or less',
      )
      cy.get('#goal-achievement-helped').should('not.be.empty')
      cy.checkAccessibility()
    })

    it('Cancel goal achieved and redirect successfully', () => {
      cy.get('a').contains('Do not mark as achieved').click()
      cy.url().should('include', 'update-goal-steps/')
      cy.checkAccessibility()
    })
  })
})
