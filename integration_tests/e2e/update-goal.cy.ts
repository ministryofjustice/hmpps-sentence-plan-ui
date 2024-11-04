import DataGenerator from '../support/DataGenerator'
import { PlanType } from '../../server/@types/PlanType'
import PlanOverview from '../pages/plan-overview'
import UpdateGoal from '../pages/update-goal'

describe('Update goal', () => {
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('plan')
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
    })
  })

  describe('Set-up agreed plan', () => {
    beforeEach(() => {
      cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
        cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal()).then(goal => {
          cy.addStepToGoal(goal.uuid, DataGenerator.generateStep())
        })

        cy.visit(`/agree-plan`)
      })
    })
    it('Can select and update a step status', () => {
      const planOverview = new PlanOverview()
      planOverview.agreePlan()
      cy.url().should('satisfy', url => url.endsWith('/plan')) // check we're back to plan-overview
      cy.contains('a', 'Update').click() // click update link
      cy.url().should('include', '/update-goal') // check url is update goal
      cy.get('.govuk-table__body > .govuk-table__row > :nth-child(3)').contains(
        'Not started' || 'In progress' || 'Cannot be done yet' || 'No longer needed' || 'Completed',
      ) // check contains not started status
      cy.get('#step-status-1').select('Not started') // select not started status
      cy.get('.govuk-button').contains('Save goal and steps').click()
      cy.url().should('include', '/plan') // check we're back to plan-overview
      cy.get('.govuk-table__body > .govuk-table__row > :nth-child(3)').contains('Not started') // check contains not started status
      cy.contains('a', 'Update').click() // click update link
      cy.url().should('include', '/update-goal') // check url is update goal
      cy.get('.govuk-table__body > .govuk-table__row > :nth-child(3)').contains('In progress') // check contains not started status
      cy.get('#step-status-1').select('In progress') // select not started status
      cy.get('.govuk-button').contains('Save goal and steps').click()
      cy.url().should('include', '/plan') // check we're back to plan-overview
      cy.get('.govuk-table__body > .govuk-table__row > :nth-child(3)').contains('In progress')
    })

    it('Clicking Back link does not save', () => {
      const planOverview = new PlanOverview()
      planOverview.agreePlan()
      cy.url().should('satisfy', url => url.endsWith('/plan')) // check we're back to plan-overview
      cy.contains('a', 'Update').click() // click update link
      cy.url().should('include', '/update-goal') // check url is update goal
      cy.get('.govuk-table__body > .govuk-table__row > :nth-child(3)').contains(
        'Not started' || 'In progress' || 'Cannot be done yet' || 'No longer needed' || 'Completed',
      ) // check contains not started status
      cy.get('#step-status-1').select('Not started') // select not started status
      cy.get('.govuk-button').contains('Save goal and steps').click()
      cy.url().should('include', '/plan') // check we're back to plan-overview
      cy.get('.govuk-table__body > .govuk-table__row > :nth-child(3)').contains('Not started') // check contains not started status
      cy.contains('a', 'Update').click() // click update link
      cy.url().should('include', '/update-goal') // check url is update goal
      cy.get('.govuk-table__body > .govuk-table__row > :nth-child(3)').contains('In progress') // check contains not started status
      cy.get('#step-status-1').select('In progress') // select not started status
      cy.contains('a', 'Back').click()
      cy.get('.govuk-table__body > .govuk-table__row > :nth-child(3)').contains('Not started') // check contains not started status
    })

    it('Can save and view notes attached to a goal', () => {
      const planOverview = new PlanOverview()
      planOverview.agreePlan()
      const updateGoal = new UpdateGoal()
      updateGoal.createNotes()
      cy.contains('a', 'Update').click() // click update link
      cy.contains('View all notes').click() // open drop down of notes
      cy.get('.govuk-details__text').contains(updateGoal.notesEntry) // check if created note is there
    })
  })
})
