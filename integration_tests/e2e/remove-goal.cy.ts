import { NewGoal } from '../../server/@types/NewGoalType'
import { Goal } from '../../server/@types/GoalType'
import DataGenerator from '../support/DataGenerator'
import { PlanType } from '../../server/@types/PlanType'
import { NewStep } from '../../server/@types/StepType'

describe('Remove a goal', () => {
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('plan')
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
    })
  })

  describe('Rendering delete goal', () => {
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
          cy.visit(`/confirm-delete-goal/${goal.uuid}`)
        })
      })

      // Check goal data is rendered correctly
      cy.get('.goal-summary-card')
        .should('contain', goalData.title)
        .and('contain', `No steps added`)
        .and('contain', `Area of need: ${goalData.areaOfNeed.toLowerCase()}`)
        .and('contain', `Also relates to: ${goalData.relatedAreasOfNeed[0].toLowerCase()}`)
        .and('not.contain', `Add steps`)
    })

    it('Goal with steps renders correctly', () => {
      // Setup steps and goal, access remove goal page
      const stepData: NewStep[] = [DataGenerator.generateStep(), DataGenerator.generateStep()]

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
    })
  })

  describe('Behaviours', () => {
    let goalData

    beforeEach(() => {
      goalData = DataGenerator.generateGoal()
      cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
        cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal())
        cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal())
        cy.addGoalToPlan(plan.uuid, goalData).as('goal')
      })
    })

    it('When confirmed, goal is deleted', () => {
      // Go to plan-summary page, check goal appears
      cy.visit(`/plan-summary`)
      cy.get('.goal-list .goal-summary-card').should('have.length', 3).and('contain', goalData.title)

      // Click remove goal
      cy.contains('.goal-summary-card', goalData.title).within(() => {
        cy.contains('a', 'Delete goal').click()
      })

      // Check we've landed on confirm goal deletion page
      cy.get<Goal>('@goal').then(goal => {
        cy.url().should('contain', `/confirm-delete-goal/${goal.uuid}`)
      })
      cy.get('.goal-summary-card').should('contain', goalData.title)

      // Confirm delete
      cy.contains('button', 'Confirm').click()

      // Check goal has been deleted
      cy.url().should('contain', '/plan?type=current&status=removed')
      cy.get('.goal-list .goal-summary-card').should('have.length', 2).and('not.contain', goalData.title)
    })
  })
})
