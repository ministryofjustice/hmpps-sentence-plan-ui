import { faker } from '@faker-js/faker'
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
      const planOverview = new PlanOverview()
      cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
        cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal()).then(goal => {
          cy.addStepToGoal(goal.uuid, DataGenerator.generateStep())
        })

        planOverview.agreePlan()
      })
    })
    it('Can select and update a step status', () => {
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
      const updateGoal = new UpdateGoal()
      updateGoal.createNote()
      cy.contains('a', 'Update').click() // click update link
      cy.contains('View all notes').click() // open drop down of notes
      cy.get('.govuk-details__text').contains(updateGoal.notesEntry) // check if created note is there
    })

    it('Entering a long progress note diplays an error', () => {
      const lorem = faker.lorem.paragraphs(40)
      cy.contains('a', 'Update').click() // click update link
      cy.url().should('include', '/update-goal')
      cy.get('#more-detail').invoke('val', lorem)
      cy.get('.govuk-button').contains('Save goal and steps').click()

      cy.get('.govuk-error-summary').should('contain', 'Notes about progress must be 4,000 characters or less')
      cy.get('#more-detail-error').should('contain', 'Notes about progress must be 4,000 characters or less')
      cy.get('#more-detail').should('contain', lorem)
    })
  })
})
