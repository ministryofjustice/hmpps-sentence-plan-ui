import PlanOverview from '../pages/plan-overview'
import { PlanType } from '../../server/@types/PlanType'
import DataGenerator from '../support/DataGenerator'

describe('View Plan Overview for READ_WRITE user', () => {
  const planOverview = new PlanOverview()

  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('plan')
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
    })
  })

  it('Should have a Create goal button and it should take to create goal', () => {
    cy.visit('/plan')
    cy.contains('a', 'Create goal').click()
    cy.url().should('include', '/create-goal/')
    cy.checkAccessibility()
  })

  it('Should have a `Return to OASys` button and it should return the user to the OASys return URL', () => {
    cy.contains('a', 'Return to OASys').should('have.attr', 'href').and('include', Cypress.env('OASTUB_URL'))
    cy.checkAccessibility()
  })

  it('Should not have `Agreed/Last updated/Created` text when Plan is not Agreed', () => {
    cy.visit('/plan')
    cy.get('.govuk-grid-column-full').should('not.contain', 'agreed to their plan on')
    cy.get('.govuk-grid-column-full').should('not.contain', 'Last updated')
    cy.get('.govuk-grid-column-full').should('not.contain', 'Plan created on')

    // also create a Goal and make sure the text still does not appear
    cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
      cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal({ title: 'Test Accommodation' }))
      cy.visit('/plan')
    })

    cy.get('.govuk-grid-column-full').should('not.contain', 'Last updated')
  })

  it('Should have text saying no goals to work on now on Goals for now tab', () => {
    cy.visit('/plan')
    cy.get('.govuk-grid-column-full').should('contain', 'does not have any goals to work on now. You can either:')
    cy.checkAccessibility()
  })

  it('Should have text saying no future goals present on Future goals tab', () => {
    cy.visit('/plan')
    cy.get('.moj-sub-navigation__link').contains('Future goals').click()
    cy.get('.govuk-grid-column-full').should('contain', 'does not have any future goals in their plan')
    cy.checkAccessibility()
  })

  it('Plan with goals and no steps should have Add steps link and takes to takes to add-steps page', () => {
    cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
      cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal({ title: 'Test Accommodation' }))
      cy.visit('/plan')
    })
    cy.contains('a', 'Add steps').click()
    cy.url().should('include', '/add-steps')
    cy.checkAccessibility()
  })

  it('Plan with goals and steps should have required links and status as not started', () => {
    cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
      cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal({ title: 'Test Accommodation' }))
      cy.visit('/plan')
    })
    cy.contains('a', 'Add steps').click()

    const firstStep = DataGenerator.generateStep()

    cy.get(`#step-actor-1`).select(firstStep.actor)
    cy.get('#step-description-1').type('Accommodation')
    cy.get('button').contains('Save and continue').click()
    cy.url().should('include', '/plan?type=current')
    cy.get('.goal-summary-card')
    cy.contains('.goal-summary-card', 'Accommodation').within(() => {
      cy.contains('a', 'Change goal')
      cy.contains('a', 'Add or change steps')
      cy.contains('a', 'Delete')
      cy.get('.govuk-tag').contains('Not started')
    })
    cy.checkAccessibility()
  })

  describe('Tests for agreeing a plan', () => {
    it('Agreeing a plan with no goals should result in error', () => {
      cy.visit('/plan')
      cy.get('button').contains('Agree plan').click()
      cy.title().should('contain', 'Error:')
      cy.get('.govuk-error-summary').should('contain', 'To agree the plan, create a goal to work on now')
      cy.checkAccessibility()
    })

    it('Agreeing a plan with a future goal but no current goals should result in error', () => {
      cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
        const newGoal = DataGenerator.generateGoal({ title: 'Test Accommodation' })
        newGoal.targetDate = null
        cy.addGoalToPlan(plan.uuid, newGoal)
      })
      cy.visit('/plan')
      cy.get('button').contains('Agree plan').click()
      cy.title().should('contain', 'Error:')
      cy.get('.govuk-error-summary').should('contain', 'To agree the plan, create a goal to work on now')
      cy.checkAccessibility()
    })

    it('Agreeing a Plan with goals but no steps should result in error', () => {
      cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
        cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal({ title: 'Test Accommodation' }))
        cy.visit('/plan')
      })

      cy.get('button').contains('Agree plan').click()
      cy.title().should('contain', 'Error:')
      cy.get('.govuk-error-summary').should('contain', "Add steps to 'Test Accommodation'")
      cy.get('.govuk-error-message').should('contain', "Add steps to 'Test Accommodation'")
      cy.checkAccessibility()
    })

    it('Agreeing a Plan with valid goals and steps should go to /agree-plan', () => {
      cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
        cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal({ title: 'Test Accommodation' }))
        cy.visit('/plan')
      })
      cy.contains('a', 'Add steps').click()

      const firstStep = DataGenerator.generateStep()

      cy.get(`#step-actor-1`).select(firstStep.actor)
      cy.get(`#step-description-1`).type('Accommodation')
      cy.get('button').contains('Save and continue').click()
      cy.get('button').contains('Agree plan').click()
      cy.url().should('include', '/agree-plan')
      cy.checkAccessibility()
    })
  })

  describe('Tests for an Agreed Plan', () => {
    it('Agreed plan shows message showing when it was agreed', () => {
      cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
        cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal({ title: 'Test Accommodation' })).then(goal => {
          cy.addStepToGoal(goal.uuid, DataGenerator.generateStep())
          cy.visit('/plan')
        })
      })
      planOverview.agreePlan()
      cy.get('.plan-header+p').should('contain', 'agreed to their plan on')
      cy.get('.plan-header+p').should('not.contain', 'Last updated on')
    })

    it('Agreed plan with `did not agree` shows message showing when it was created', () => {
      cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
        cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal({ title: 'Test Accommodation' })).then(goal => {
          cy.addStepToGoal(goal.uuid, DataGenerator.generateStep())
          cy.visit('/plan')
        })
      })
      planOverview.agreePlanDidNotAgree()
      cy.get('.plan-header+p').should('contain', 'Plan created on')
      cy.get('.plan-header+p').should('not.contain', 'Last updated on')
    })

    it('Agreed plan with `could not answer` shows message showing when it was created', () => {
      cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
        cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal({ title: 'Test Accommodation' })).then(goal => {
          cy.addStepToGoal(goal.uuid, DataGenerator.generateStep())
          cy.visit('/plan')
        })
      })
      planOverview.agreePlanCouldNotAgree()
      cy.get('.plan-header+p').should('contain', 'Plan created on')
      cy.get('.plan-header+p').should('not.contain', 'Last updated on')
    })

    it('Agreed plan with updated goal shows message saying when it was last updated', () => {
      cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
        cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal({ title: 'Test Accommodation' })).then(goal => {
          cy.addStepToGoal(goal.uuid, DataGenerator.generateStep())
          cy.visit('/plan')
          planOverview.agreePlan()

          // take any action on a goal that updates lastUpdated field
          cy.removeGoalFromPlan(goal.uuid, 'A removal note')

          // reload the page to see the updated message
          cy.visit('/plan')
        })
      })

      cy.get('.plan-header+p').should('not.contain', 'agreed to their plan on')
      cy.get('.plan-header+p').should('contain', 'Last updated on')
    })

    it('Agreed plan can show when a goal was removed', () => {
      cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
        cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal({ title: 'Test Accommodation' })).then(goal => {
          cy.addStepToGoal(goal.uuid, DataGenerator.generateStep())
          cy.visit('/plan')
        })
      })
      planOverview.agreePlan()
      cy.contains('a', 'Update').click()
      cy.contains('button', 'Remove goal from plan').click()
      cy.get('#goal-removal-note').type('Removed during cypress test')
      cy.get('button').contains('Confirm').click()
      cy.get('.goal-date-and-notes > :nth-child(1)').contains('Removed on')
      cy.get('.goal-date-and-notes > :nth-child(2)').contains('Removed during cypress test')
    })

    it('Agreed plan shows validation error when goal has no steps', () => {
      cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
        cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal({ title: 'Test Accommodation 1' })).then(goal => {
          cy.addStepToGoal(goal.uuid, DataGenerator.generateStep())
          planOverview.agreePlan()
          cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal({ title: 'Test Accommodation 2' }))
        })
      })

      cy.visit('/plan')

      cy.get('.govuk-error-summary').should('contain', "Add steps to 'Test Accommodation 2'")
      cy.get('p.govuk-error-message').should('contain', "Add steps to 'Test Accommodation 2'")
    })

    it('Agreed plan does not show validation error when removed goal has no steps', () => {
      cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
        cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal({ title: 'Test Accommodation 1' })).then(goal => {
          cy.addStepToGoal(goal.uuid, DataGenerator.generateStep())
          planOverview.agreePlan()
        })

        const secondGoal = DataGenerator.generateGoal({ title: 'Test Accommodation 2' })
        cy.addGoalToPlan(plan.uuid, secondGoal).then(goal => {
          cy.removeGoalFromPlan(goal.uuid, 'Reason for removing goal')
        })
      })

      cy.visit('/plan')

      cy.get('.govuk-error-summary').should('not.exist')
      cy.get('p.govuk-error-message').should('not.exist')
    })
  })

  describe('Tests moving goals up and down', () => {
    it('Creates three new goals, and moves the middle goal up', () => {
      cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
        ;[1, 2, 3].forEach(i => {
          cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal({ title: `Test Accommodation ${i}` }))
        })
        cy.visit('/plan')
      })

      planOverview.clickUpOnSummaryCard(1)

      planOverview
        .getSummaryCard(0)
        .should('contain', 'Test Accommodation 2')
        .and('contain', 'Move goal down')
        .and('not.contain', 'Move goal up')
      planOverview
        .getSummaryCard(1)
        .should('contain', 'Test Accommodation 1')
        .and('contain', 'Move goal down')
        .and('contain', 'Move goal up')
      cy.checkAccessibility()
    })

    it('Creates three new goals, and moves the middle goal down', () => {
      cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
        ;[1, 2, 3].forEach(i => {
          cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal({ title: `Test Accommodation ${i}` }))
        })
        cy.visit('/plan')
      })

      planOverview.clickDownOnSummaryCard(1)

      planOverview
        .getSummaryCard(1)
        .should('contain', 'Test Accommodation 3')
        .and('contain', 'Move goal down')
        .and('contain', 'Move goal up')
      planOverview
        .getSummaryCard(2)
        .should('contain', 'Test Accommodation 2')
        .and('contain', 'Move goal up')
        .and('not.contain', 'Move goal down')
      cy.checkAccessibility()
    })
  })
})
