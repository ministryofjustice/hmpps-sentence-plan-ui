import DataGenerator from '../support/DataGenerator'
import { PlanType } from '../../server/@types/PlanType'

describe('Agree plan', () => {
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('plan')
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
    })
  })

  describe('Rendering', () => {
    beforeEach(() => {
      cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
        cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal()).then(goal => {
          cy.addStepToGoal(goal.uuid, DataGenerator.generateStep())
        })

        cy.visit(`/agree-plan`)
      })
    })

    it('Display agree plan page correctly on load', () => {
      cy.url()
      cy.get('.govuk-fieldset__heading').contains('agree to this plan?')
      cy.get('.govuk-label').contains('Yes')
      cy.get('.govuk-label').contains('No')
      cy.get('.govuk-label').contains('could not answer this question')
      cy.get('.govuk-label').contains('Add any notes (optional)')
      cy.get('.govuk-button').contains('Agree plan with')
    })
  })

  describe('Validation behaviour', () => {
    describe('Invalid plan', () => {
      it('Do not allow access to agree-plan for plan with no goals', () => {
        cy.visit(`/agree-plan`)

        cy.url().should('eq', 'http://localhost:3000/plan')
      })

      it('Do not allow access to agree-plan for plan with current goals missing steps', () => {
        const futureGoal = {
          ...DataGenerator.generateGoal(),
          targetDate: undefined,
        }

        cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
          cy.addGoalToPlan(plan.uuid, futureGoal)
          cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal())
          cy.visit(`/agree-plan`)
        })

        cy.url().should('eq', 'http://localhost:3000/plan')
      })
    })

    describe('Valid plan', () => {
      beforeEach(() => {
        cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
          cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal()).then(goal => {
            cy.addStepToGoal(goal.uuid, DataGenerator.generateStep())
          })

          cy.visit(`/agree-plan`)
        })
      })

      it('Allow access to agree-plan for plan with future goals missing steps', () => {
        const futureGoal = {
          ...DataGenerator.generateGoal(),
          targetDate: undefined,
        }

        cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
          cy.addGoalToPlan(plan.uuid, futureGoal)
          cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal()).then(goal => {
            cy.addStepToGoal(goal.uuid, DataGenerator.generateStep())
          })

          cy.visit(`/agree-plan`)
          cy.url().should('include', `/agree-plan`)
        })
      })

      it('Display validation error if nothing is selected', () => {
        cy.get('.govuk-button').click()

        cy.contains('#agree-plan-radio-error', 'Select if they agree to the plan')
        cy.title().should('contain', 'Error:')
      })
      it('Display validation error if No is selected but no details provided', () => {
        cy.get('#agree-plan-radio-2').click()
        cy.get('.govuk-button').click()

        cy.contains('#does-not-agree-details-error', 'Enter details about why they do not agree')
        cy.title().should('contain', 'Error:')
      })
      it('Display validation error if Not answered is selected but no details provided', () => {
        cy.get('#agree-plan-radio-3').click()
        cy.get('.govuk-button').click()

        cy.contains('#could-not-answer-details-error', 'Enter details about why they cannot answer')
        cy.title().should('contain', 'Error:')
      })
    })
  })

  describe('Submission behaviour', () => {
    beforeEach(() => {
      cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
        cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal()).then(goal => {
          cy.addStepToGoal(goal.uuid, DataGenerator.generateStep())
        })

        cy.visit(`/agree-plan`)
      })
    })

    it('Submit successfully when Yes is selected and additional notes provided', () => {
      cy.get('#agree-plan-radio').click()
      cy.get('#notes').type('abc')

      cy.get('.govuk-button').click()

      cy.url().should('satisfy', url => url.endsWith('/plan'))
    })
    it('Submit successfully when No is selected and additional information provided', () => {
      cy.get('#agree-plan-radio-2').click()
      cy.get('#does-not-agree-details').type('abc')

      cy.get('.govuk-button').click()

      cy.url().should('satisfy', url => url.endsWith('/plan'))
    })
    it('Submit successfully when "Could not answer this question" is selected and additional information provided', () => {
      cy.get('#agree-plan-radio-3').click()
      cy.get('#could-not-answer-details').type('abc')

      cy.get('.govuk-button').click()

      cy.url().should('satisfy', url => url.endsWith('/plan'))
    })
  })
})
