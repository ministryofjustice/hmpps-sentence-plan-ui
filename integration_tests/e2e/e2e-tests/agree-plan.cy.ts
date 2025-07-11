import { faker } from '@faker-js/faker'
import DataGenerator from '../../support/DataGenerator'
import { PlanType } from '../../../server/@types/PlanType'
import { AccessMode } from '../../../server/@types/Handover'

describe('Agree plan', () => {
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
        cy.openSentencePlan(oasysAssessmentPk, { accessMode: AccessMode.READ_ONLY })
      })

      cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
        cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal()).then(goal => {
          cy.addStepToGoal(goal.uuid, DataGenerator.generateStep())
        })

        cy.visit(`/agree-plan`, { failOnStatusCode: false })
        cy.get('.govuk-body').should('contain', 'You do not have permission to perform this action')

        cy.checkAccessibility(true, ['scrollable-region-focusable'])
      })
    })
  })

  describe('Rendering', () => {
    beforeEach(() => {
      cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
        cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal()).then(goal => {
          cy.addStepToGoal(goal.uuid, DataGenerator.generateStep())
        })

        cy.visit(`/plan`)
      })
    })

    it('Display agree plan page correctly on load', () => {
      cy.get('button[value="agree-plan"]').click()
      cy.get('.moj-primary-navigation__container').should('not.contain', `Plan history`)
      cy.get('.govuk-fieldset__heading').contains('agree to this plan?')
      cy.get('.govuk-label').contains('Yes, I agree')
      cy.get('.govuk-label').contains('No, I do not agree')
      cy.get('.govuk-label').contains('could not answer this question')
      cy.get('#agree-plan-radio-4-item-hint').contains('Share this plan with')
      cy.get('.govuk-label').contains('Add any notes (optional)')
      cy.get('.govuk-button').contains('Save')
      cy.get('.govuk-back-link').should('have.attr', 'href', '/plan?type=current')
      cy.checkAccessibility()
      cy.hasFeedbackLink()
    })
  })

  describe('Validation behaviour', () => {
    describe('Invalid plan', () => {
      it('Do not allow access to agree-plan for plan with no goals', () => {
        cy.visit(`/agree-plan`)

        cy.url().should('satisfy', url => url.endsWith('/plan'))
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

        cy.url().should('satisfy', url => url.endsWith('/plan'))
        cy.checkAccessibility()
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
        cy.checkAccessibility()
      })

      it('Display validation error if nothing is selected', () => {
        cy.get('.govuk-button').click()

        cy.contains(
          '#agree-plan-radio-error',
          'Select if they agree to the plan, or that they could not answer this question',
        )
        cy.title().should('contain', 'Error:')
        cy.checkAccessibility()
      })

      it('Display validation error if No is selected but no details provided', () => {
        cy.get('#agree-plan-radio-2').click()
        cy.get('.govuk-button').click()

        cy.contains('#does-not-agree-details-error', 'Enter details about why they do not agree')
        cy.title().should('contain', 'Error:')
        cy.checkAccessibility()
      })

      it('Display validation error if Not answered is selected but no details provided', () => {
        cy.get('#agree-plan-radio-4').click()
        cy.get('.govuk-button').click()

        cy.contains('#could-not-answer-details-error', 'Enter details about why they could not answer')
        cy.title().should('contain', 'Error:')
        cy.checkAccessibility()
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
      cy.get('.moj-primary-navigation__container').should('not.contain', `Plan history`)
      cy.get('#agree-plan-radio').click()
      cy.get('#notes').type('abc')

      cy.get('.govuk-button').click()

      cy.url().should('satisfy', url => url.endsWith('/plan'))
      cy.get('.moj-primary-navigation__container').contains(`Plan history`)
      cy.checkAccessibility()
    })

    it('Displays errors if Yes is selected and long additional notes provided', () => {
      const lorem = faker.lorem.paragraphs(40)

      cy.get('#agree-plan-radio').click()
      cy.get('#notes').invoke('val', lorem)

      cy.get('.govuk-button').click()

      cy.url().should('satisfy', url => url.endsWith('/agree-plan'))
      cy.get('.govuk-error-summary').should('contain', 'Notes must be 4,000 characters or less')
      cy.get('#notes-error').should('contain', 'Notes must be 4,000 characters or less')

      cy.get('#notes').should('contain', lorem)
      cy.get('.govuk-back-link').should('have.attr', 'href', '/plan?type=current')
      cy.checkAccessibility()
    })

    it('Submit successfully when No is selected and additional information provided', () => {
      cy.get('#agree-plan-radio-2').click()
      cy.get('#does-not-agree-details').type('abc')

      cy.get('.govuk-button').click()

      cy.url().should('satisfy', url => url.endsWith('/plan'))
      cy.checkAccessibility()
    })

    it('Displays errors when No is selected and long additional information provided', () => {
      const lorem = faker.lorem.paragraphs(40).replace(/(\r\n|\n|\r)/gm, '')

      cy.get('#agree-plan-radio-2').click()
      cy.get('#does-not-agree-details').invoke('val', lorem)

      cy.get('.govuk-button').click()

      cy.url().should('satisfy', url => url.endsWith('/agree-plan'))
      cy.get('.govuk-error-summary').should(
        'contain',
        'Details on why they do not agree must be 4,000 characters or less',
      )
      cy.get('#does-not-agree-details-error').should(
        'contain',
        'Details on why they do not agree must be 4,000 characters or less',
      )

      cy.get('#does-not-agree-details').should('contain', lorem)
      cy.checkAccessibility()
    })

    it('Submit successfully when "Could not answer this question" is selected and additional information provided', () => {
      cy.get('#agree-plan-radio-4').click()
      cy.get('#could-not-answer-details').type('abc')

      cy.get('.govuk-button').click()

      cy.url().should('satisfy', url => url.endsWith('/plan'))
      cy.checkAccessibility()
    })

    it('Display errors when "Could not answer this question" is selected and long additional information provided', () => {
      const lorem = faker.lorem.paragraphs(40).replace(/(\r\n|\n|\r)/gm, '')

      cy.get('#agree-plan-radio-4').click()
      cy.get('#could-not-answer-details').invoke('val', lorem)

      cy.get('.govuk-button').click()

      cy.url().should('satisfy', url => url.endsWith('/agree-plan'))
      cy.get('.govuk-error-summary').should(
        'contain',
        'Details on why they could not agree must be 4,000 characters or less',
      )
      cy.get('#could-not-answer-details-error').should(
        'contain',
        'Details on why they could not agree must be 4,000 characters or less',
      )

      cy.get('#could-not-answer-details').should('contain', lorem)
      cy.checkAccessibility()
    })
  })
})
