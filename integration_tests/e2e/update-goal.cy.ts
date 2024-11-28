import { faker } from '@faker-js/faker'
import DataGenerator from '../support/DataGenerator'
import { PlanType } from '../../server/@types/PlanType'
import PlanOverview from '../pages/plan-overview'
import UpdateGoal from '../pages/update-goal'
import { Goal } from '../../server/@types/GoalType'

describe('Update goal', () => {
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('plan')
      cy.wrap(planDetails.oasysAssessmentPk).as('oasysAssessmentPk')
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
    })
  })

  describe('Set-up agreed plan', () => {
    beforeEach(() => {
      const planOverview = new PlanOverview()
      cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
        cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal()).then(goal => {
          cy.wrap(goal).as('updateableGoal')
          cy.addStepToGoal(goal.uuid, DataGenerator.generateStep())
        })

        planOverview.agreePlan()
      })
    })

    it('Should display authorisation error if user does not have READ_WRITE role', () => {
      cy.get<string>('@oasysAssessmentPk').then(oasysAssessmentPk => {
        cy.openSentencePlan(oasysAssessmentPk, 'READ_ONLY')
      })

      cy.get<Goal>('@updateableGoal').then(goal => {
        cy.visit(`/update-goal/${goal.uuid}`, { failOnStatusCode: false })
        cy.get('.govuk-body').should('contain', 'You do not have permission to perform this action')
      })
      cy.checkAccessibility()
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
      cy.checkAccessibility()
    })

    it('Can visit change goal and back link is correct', () => {
      cy.contains('a', 'Update').click()
      cy.contains('a', 'Update goal details').click()
      cy.url().should('include', '/change-goal/')
      cy.url().then(url => {
        const goalUuid = url.substring(url.lastIndexOf('/') + 1)
        cy.contains('a', 'Back').should('have.attr', 'href', `/update-goal/${goalUuid}`)
      })
      cy.checkAccessibility()
    })

    it('Clicking Back link does not save', () => {
      cy.contains('a', 'Update').click() // click update link
      cy.url().should('include', '/update-goal') // check url is update goal
      cy.get('.govuk-table__body > .govuk-table__row > :nth-child(3)').contains(
        'Not started' || 'In progress' || 'Cannot be done yet' || 'No longer needed' || 'Completed',
      ) // check contains not started status
      cy.get('#step-status-1').select('Not started') // select Not started status
      cy.get('.govuk-button').contains('Save goal and steps').click()
      cy.url().should('include', '/plan') // check we're back to plan-overview
      cy.get('.govuk-table__body > .govuk-table__row > :nth-child(3)').contains('Not started') // check contains Not started status
      cy.contains('a', 'Update').click() // click update link
      cy.get('.govuk-table__body > .govuk-table__row > :nth-child(3)').contains('In progress') // check contains In progress status
      cy.get('#step-status-1').select('In progress') // select In progress status
      cy.contains('a', 'Back').click()
      cy.get('.govuk-table__body > .govuk-table__row > :nth-child(3)').contains('Not started') // check contains Not started status
      cy.checkAccessibility()
    })

    it('Can save and view notes attached to a goal', () => {
      const updateGoal = new UpdateGoal()
      updateGoal.createNote()
      cy.contains('a', 'Update').click() // click update link
      cy.contains('View all notes').click() // open drop down of notes
      cy.get('.govuk-details__text').contains(updateGoal.notesEntry) // check if created note is there
      cy.checkAccessibility()
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
      cy.checkAccessibility()
    })
  })
})
