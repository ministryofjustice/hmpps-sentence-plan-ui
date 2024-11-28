import { faker } from '@faker-js/faker'
import { NewGoal } from '../../server/@types/NewGoalType'
import { Goal } from '../../server/@types/GoalType'
import DataGenerator from '../support/DataGenerator'
import { PlanType } from '../../server/@types/PlanType'
import { NewStep } from '../../server/@types/StepType'
import PlanOverview from '../pages/plan-overview'

describe('Remove a goal from a Plan after it has been agreed', () => {
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('plan')
      cy.wrap(planDetails.oasysAssessmentPk).as('oasysAssessmentPk')
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
    })
  })

  describe('Security', () => {
    it('Should display authorisation error if user does not have READ_WRITE role', () => {
      cy.get<string>('@oasysAssessmentPk').then(oasysAssessmentPk => {
        cy.openSentencePlan(oasysAssessmentPk, 'READ_ONLY')
      })

      cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
        cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal()).then(goal => {
          cy.visit(`/remove-goal/${goal.uuid}`, { failOnStatusCode: false })
        })
      })

      cy.get('.govuk-body').should('contain', 'You do not have permission to perform this action')
      cy.checkAccessibility()
    })
  })

  describe('Rendering remove goal', () => {
    const goalData: NewGoal = {
      title: 'Test goal',
      areaOfNeed: 'Drug use',
      relatedAreasOfNeed: ['Health and wellbeing'],
      targetDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
    }

    it('Goal with no steps renders correctly', () => {
      // Add goal and access remove page
      cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
        cy.addGoalToPlan(plan.uuid, goalData).then(goal => {
          cy.visit(`/remove-goal/${goal.uuid}`)
        })
      })

      // Check goal data is rendered correctly
      cy.get('.goal-summary-card')
        .should('contain', goalData.title)
        .and('contain', `No steps added`)
        .and('contain', `Area of need: ${goalData.areaOfNeed.toLowerCase()}`)
        .and('contain', `Also relates to: ${goalData.relatedAreasOfNeed[0].toLowerCase()}`)
        .and('not.contain', `Add steps`)
      cy.checkAccessibility()
    })

    it('Goal with steps renders correctly', () => {
      // Setup steps and goal, access remove goal page
      const stepData: NewStep[] = [DataGenerator.generateStep({}), DataGenerator.generateStep({})]

      cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
        cy.addGoalToPlan(plan.uuid, goalData).then(goal => {
          cy.addStepToGoal(goal.uuid, stepData[0])
          cy.addStepToGoal(goal.uuid, stepData[1])
          cy.visit(`/confirm-delete-goal/${goal.uuid}`)
        })
      })

      // Check goal data is rendered correctly
      cy.get('.goal-summary-card')
        .should('contain', goalData.title)
        .and('contain', `Area of need: ${goalData.areaOfNeed.toLowerCase()}`)
        .and('contain', `Also relates to: ${goalData.relatedAreasOfNeed[0].toLowerCase()}`)
        .and('not.contain', `Add steps`)

      // Check steps data is rendered correctly
      cy.get('.goal-summary-card__steps')
        .should('contain', stepData[0].description)
        .and('contain', stepData[0].actor)
        .and('contain', stepData[1].description)
        .and('contain', stepData[1].actor)
      cy.checkAccessibility()
    })
  })

  describe('Behaviours', () => {
    let goalData

    beforeEach(() => {
      const planOverview = new PlanOverview()
      cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
        goalData = DataGenerator.generateGoal({})
        cy.addGoalToPlan(plan.uuid, goalData)
          .as('goal')
          .then(goal => {
            cy.addStepToGoal(goal.uuid, DataGenerator.generateStep({}))
          })
        cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal({})).then(goal => {
          cy.addStepToGoal(goal.uuid, DataGenerator.generateStep({}))
        })
        cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal({})).then(goal => {
          cy.addStepToGoal(goal.uuid, DataGenerator.generateStep({}))
        })
      })

      planOverview.agreePlan()
    })

    it('When confirmed, and no note is provided, page with error details is rendered', () => {
      // Go to plan overview page, check goal appears
      cy.visit(`/plan`)
      cy.get('.goal-list .goal-summary-card').should('have.length', 3).and('contain', goalData.title)

      // Click remove goal
      cy.contains('.goal-summary-card', goalData.title).within(() => {
        cy.contains('a', 'Remove').click()
      })

      // Check we've landed on confirm goal remove page
      cy.get<Goal>('@goal').then(goal => {
        cy.url().should('contain', `/remove-goal/${goal.uuid}`)
      })
      cy.get('.goal-summary-card').should('contain', goalData.title)

      // Confirm delete
      cy.contains('button', 'Confirm').click()

      // Check page has been re-rendered with error summary and highlight on the notes box
      cy.get<Goal>('@goal').then(goal => {
        cy.url().should('contain', `/remove-goal/${goal.uuid}`)
      })
      cy.get('.govuk-error-summary').should('contain', 'Enter why you want to remove this goal')
      cy.get('.govuk-error-message').should('contain', 'Enter why you want to remove this goal')
      cy.checkAccessibility()
    })

    it('When confirmed, and a note is provided, goal is removed', () => {
      // Go to plan overview page, check goal appears
      cy.visit(`/plan`)
      cy.get('.goal-list .goal-summary-card').should('have.length', 3).and('contain', goalData.title)

      // Click remove goal
      cy.contains('.goal-summary-card', goalData.title).within(() => {
        cy.contains('a', 'Remove').click()
      })

      // Check we've landed on confirm goal remove page
      cy.get<Goal>('@goal').then(goal => {
        cy.url().should('contain', `/remove-goal/${goal.uuid}`)
      })
      cy.get('.goal-summary-card').should('contain', goalData.title)

      // Add note text
      cy.get('#goal-removal-note').type('Some optional text in the note field')

      // Confirm delete
      cy.contains('button', 'Confirm').click()

      // Check goal has been removed
      cy.url().should('contain', '/plan?type=removed&status=removed')
      cy.get('.goal-list .goal-summary-card').should('have.length', 1).and('contain', goalData.title)
      cy.checkAccessibility()
    })

    it('When confirmed, and a long note is provided, page with error details is rendered', () => {
      const lorem = faker.lorem.paragraphs(40)

      // Go to plan overview page, check goal appears
      cy.visit(`/plan`)

      // Click remove goal
      cy.contains('.goal-summary-card', goalData.title).within(() => {
        cy.contains('a', 'Remove').click()
      })

      // Add note text
      cy.get('#goal-removal-note').invoke('val', lorem)

      // Confirm delete
      cy.contains('button', 'Confirm').click()

      // Check page has been re-rendered with error summary and highlight on the notes box
      cy.get<Goal>('@goal').then(goal => {
        cy.url().should('contain', `/remove-goal/${goal.uuid}`)
      })
      cy.get('.govuk-error-summary').should(
        'contain',
        'The reason for removing this goal must be 4,000 characters or less',
      )
      cy.get('.govuk-error-message').should(
        'contain',
        'The reason for removing this goal must be 4,000 characters or less',
      )

      cy.get('#goal-removal-note').should('contain', lorem)
      cy.checkAccessibility()
    })

    it('When goal is removed, view details is available and has correct content', () => {
      const planOverview = new PlanOverview()

      // Click remove goal
      cy.contains('.goal-summary-card', goalData.title).within(() => {
        cy.contains('a', 'Remove').click()
      })

      // Add note text
      cy.get('#goal-removal-note').type('Some optional text in the note field')

      // Confirm delete
      cy.contains('button', 'Confirm').click()

      // Check goal has been removed
      cy.url().should('contain', '/plan?type=removed&status=removed')
      cy.get('.goal-list .goal-summary-card').should('have.length', 1).and('contain', goalData.title)
      planOverview.getSummaryCard(0).get('a').contains('View details').click()
      cy.get('.govuk-details__text').should('contain', 'Some optional text in the note field')
      cy.get('h2').should('contain', goalData.title)
      cy.get('p.govuk-body').should('contain', 'Removed on ')
      cy.get('a.govuk-back-link').should('have.attr', 'href').and('include', '/plan?type=removed')
      cy.get('.govuk-button--secondary').should('contain', 'Add to plan')
      cy.checkAccessibility()
    })
  })
})
