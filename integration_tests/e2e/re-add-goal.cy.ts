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

      // add a second goal so that we can test that the order changes when adding back
      // cy.addGoalToPlan(planDetails.plan.uuid, DataGenerator.generateGoal()).then(goal => {
      //   cy.addStepToGoal(goal.uuid, DataGenerator.generateStep())
      //   cy.agreePlan(planDetails.plan.uuid)
      // })
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

  it('Confirming re-add goal with target date loads plan overview on current goals tab', () => {
    cy.visit(`/view-removed-goal/${removedGoal.uuid}`)
    cy.get('a.add-to-plan').click()
    cy.get('#re-add-goal-reason').type('A reason')
    cy.get('input[name="start-working-goal-radio"][value="yes"]').click()
    cy.get('label').contains('In 6 months').click()
    cy.get('button').contains('Confirm').click()
    cy.url().should('contain', `/plan?type=current`)
  })

  it('Confirming re-add goal without target date loads plan overview on future goals tab', () => {
    cy.visit(`/view-removed-goal/${removedGoal.uuid}`)
    cy.get('a.add-to-plan').click()
    cy.get('#re-add-goal-reason').type('A reason')
    cy.get('input[name="start-working-goal-radio"][value="no"]').click()
    cy.get('button').contains('Confirm').click()
    cy.url().should('contain', `/plan?type=future`)
  })

  it('Re-adding a goal adds a note to the Plan History', () => {
    const RE_ADD_REASON = 'A reason for re-adding the goal'

    cy.visit(`/view-removed-goal/${removedGoal.uuid}`)
    cy.get('a.add-to-plan').click()
    cy.get('#re-add-goal-reason').type(RE_ADD_REASON)
    cy.get('input[name="start-working-goal-radio"][value="no"]').click()
    cy.get('button').contains('Confirm').click()

    cy.visit('/plan-history')
    cy.get('.goal-status').first().should('contain.text', 'Goal added back into plan')
    cy.get('.goal-note').first().should('contain.text', RE_ADD_REASON)
  })

  it('Re-adding a goal puts it at the bottom of the goal list on the Plan Overview', () => {
    const RE_ADD_REASON = 'A reason for re-adding the goal'

    // add a second goal
    // confirm that the one to remove is first
    // TODO

    cy.visit(`/view-removed-goal/${removedGoal.uuid}`)
    cy.get('a.add-to-plan').click()
    cy.get('#re-add-goal-reason').type(RE_ADD_REASON)
    cy.get('input[name="start-working-goal-radio"][value="no"]').click()
    cy.get('button').contains('Confirm').click()

    // todo
    // visit plan overview
    // check order
  })
})
