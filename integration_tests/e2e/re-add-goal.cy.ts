import DataGenerator from '../support/DataGenerator'
import PlanOverview from '../pages/plan-overview'
import { Goal } from '../../server/@types/GoalType'

describe('Re-add a goal to a Plan after it has been removed', () => {
  const planOverview = new PlanOverview()
  let removedGoal: Goal

  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.openSentencePlan(planDetails.oasysAssessmentPk)

      cy.addGoalToPlan(planDetails.plan.uuid, DataGenerator.generateGoal()).then(goal => {
        cy.addStepToGoal(goal.uuid, DataGenerator.generateStep())
        planOverview.agreePlan()
        cy.removeGoalFromPlan(goal.uuid, 'A removal note')
        removedGoal = goal
      })
    })
  })

  it('visit plan page', () => {
    cy.visit(`/view-removed-goal/${removedGoal.uuid}`)
    cy.get('button.govuk-button--secondary').last().should('contain.text', 'Add to plan')
  })
})
