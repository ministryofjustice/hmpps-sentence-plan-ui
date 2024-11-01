import DataGenerator from '../support/DataGenerator'
import { PlanType } from '../../server/@types/PlanType'

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
      cy.get('.govuk-button').contains('Agree plan').click() // click agree plan with the pre-made data
      cy.url().should('satisfy', url => url.endsWith('/agree-plan')) // check correct url
      cy.get('#agree-plan-radio').click() // first radio button
      cy.get('.govuk-button').contains('Agree plan with').click() // agree/save plan
      cy.url().should('satisfy', url => url.endsWith('/plan')) // check we're back to plan-overview
      cy.contains('a', 'Update').click() // click update link
      cy.url().should('include', '/update-goal') // check url is update goal
      cy.get('.govuk-table__body > .govuk-table__row > :nth-child(3)').contains(
        'Not started' || 'In progress' || 'Cannot be done yet' || 'No longer needed' || 'Completed',
      ) // check contains not started status
      cy.get('#step-status-1').select(0) // select not started status
      cy.get('.govuk-button').contains('Save goal and steps').click()
      cy.url().should('include', '/plan') // check we're back to plan-overview
      cy.get('.govuk-table__body > .govuk-table__row > :nth-child(3)').contains('Not started') // check contains not started status
      cy.contains('a', 'Update').click() // click update link
      cy.url().should('include', '/update-goal') // check url is update goal
      cy.get('.govuk-table__body > .govuk-table__row > :nth-child(3)').contains('In progress') // check contains not started status
      cy.get('#step-status-1').select(1) // select not started status
      cy.get('.govuk-button').contains('Save goal and steps').click()
      cy.url().should('include', '/plan') // check we're back to plan-overview
      cy.get('.govuk-table__body > .govuk-table__row > :nth-child(3)').contains('In progress')
    })
    it('Clicking Back link does not save', () => {
      cy.get('.govuk-button').contains('Agree plan').click() // click agree plan with the pre-made data
      cy.url().should('satisfy', url => url.endsWith('/agree-plan')) // check correct url
      cy.get('#agree-plan-radio').click() // first radio button
      cy.get('.govuk-button').contains('Agree plan with').click() // agree/save plan
      cy.url().should('satisfy', url => url.endsWith('/plan')) // check we're back to plan-overview
      cy.contains('a', 'Update').click() // click update link
      cy.url().should('include', '/update-goal') // check url is update goal
      cy.get('.govuk-table__body > .govuk-table__row > :nth-child(3)').contains(
        'Not started' || 'In progress' || 'Cannot be done yet' || 'No longer needed' || 'Completed',
      ) // check contains not started status
      cy.get('#step-status-1').select(0) // select not started status
      cy.get('.govuk-button').contains('Save goal and steps').click()
      cy.url().should('include', '/plan') // check we're back to plan-overview
      cy.get('.govuk-table__body > .govuk-table__row > :nth-child(3)').contains('Not started') // check contains not started status
      cy.contains('a', 'Update').click() // click update link
      cy.url().should('include', '/update-goal') // check url is update goal
      cy.get('.govuk-table__body > .govuk-table__row > :nth-child(3)').contains('In progress') // check contains not started status
      cy.get('#step-status-1').select(1) // select not started status
      cy.contains('a', 'Back').click()
      cy.get('.govuk-table__body > .govuk-table__row > :nth-child(3)').contains('Not started') // check contains not started status
    })
    // it('') //should save and view notes
  })
})
