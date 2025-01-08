import DataGenerator from '../support/DataGenerator'
import { Goal } from '../../server/@types/GoalType'

describe('Re-add a goal to a Plan after it has been removed', () => {
  let removedGoal: Goal

  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.openSentencePlan(planDetails.oasysAssessmentPk)

      cy.addGoalToPlan(planDetails.plan.uuid, DataGenerator.generateGoal()).then(goal => {
        cy.addStepToGoal(goal.uuid, DataGenerator.generateStep())
        cy.agreePlan(planDetails.plan.uuid)
        cy.removeGoalFromPlan(goal.uuid, 'A removal note')
        removedGoal = goal
      })
    })
  })

  it('Remove goal details page contains button to re-add goal to plan OK', () => {
    cy.visit(`/view-removed-goal/${removedGoal.uuid}`)
    cy.get('a.add-to-plan').should('contain.text', 'Add to plan')
  })

  it('Clicking re-add goal to plan loads confirmation page', () => {
    cy.visit(`/view-removed-goal/${removedGoal.uuid}`)
    cy.get('a.add-to-plan').click()
    cy.url().should('contain', `/confirm-add-goal/${removedGoal.uuid}`)
    cy.title().should('contain', 'Confirm you want to add this goal back into the plan')
  })
})
