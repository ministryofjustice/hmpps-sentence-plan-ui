import { faker } from '@faker-js/faker'
import DataGenerator from '../support/DataGenerator'
import { PlanType } from '../../server/@types/PlanType'
import { AccessMode } from '../../server/@types/Handover'
import PlanOverview from '../pages/plan-overview'

describe('Update Agree plan', () => {
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

        cy.visit(`/update-agree-plan`, { failOnStatusCode: false })
        cy.get('.govuk-body').should('contain', 'You do not have permission to perform this action')

        cy.checkAccessibility(true, ['scrollable-region-focusable'])
      })
    })
  })

  describe('Rendering', () => {
    const planOverview = new PlanOverview()
    beforeEach(() => {
      cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
        cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal()).then(goal => {
          cy.addStepToGoal(goal.uuid, DataGenerator.generateStep())
        })

        planOverview.agreePlanCouldNotAgree()
        cy.visit(`/plan`)
      })
    })

    it('Display update agree plan page correctly on load', () => {
      cy.get('#update-assessment-text a').contains("Update Sam's agreement").click()
      cy.url().should('satisfy', url => url.endsWith('/update-agree-plan'))
      cy.get('.moj-primary-navigation__container').contains(`Plan history`)
      cy.get('.govuk-fieldset__heading').contains('Does Sam agree to their plan?')
      cy.get('.govuk-hint').contains('Sam must answer this question.')
      cy.get('.govuk-label').contains('Yes, I agree')
      cy.get('.govuk-label').contains('No, I do not agree').click()
      cy.get('.govuk-form-group').contains('Enter details')
      cy.get('textarea#does-not-agree-details').should('exist')
      cy.get('.govuk-button').contains('Save')
      cy.get('.govuk-button-group').contains("Go back to Sam's plan")
      cy.get('.govuk-back-link').should('have.attr', 'href', '/plan?type=current')
      cy.checkAccessibility()
    })
  })

  describe('Validation behaviour', () => {
    describe('Invalid plan', () => {
      it('Do not allow access to update-agree-plan for plan with no goals', () => {
        cy.visit(`/update-agree-plan`)

        cy.url().should('satisfy', url => url.endsWith('/plan'))
      })

      it('Do not allow access to update-agree-plan for plan with current goals missing steps', () => {
        const futureGoal = {
          ...DataGenerator.generateGoal(),
          targetDate: undefined,
        }

        cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
          cy.addGoalToPlan(plan.uuid, futureGoal)
          cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal())
          cy.visit(`/update-agree-plan`)
        })

        cy.url().should('satisfy', url => url.endsWith('/plan'))
        cy.checkAccessibility()
      })
    })

    describe('Valid plan', () => {
      const planOverview = new PlanOverview()
      beforeEach(() => {
        cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
          cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal()).then(goal => {
            cy.addStepToGoal(goal.uuid, DataGenerator.generateStep())
          })

          planOverview.agreePlanCouldNotAgree()
          cy.visit(`/update-agree-plan`)
        })
      })

      it('Allow access to update-agree-plan for plan with future goals missing steps', () => {
        const futureGoal = {
          ...DataGenerator.generateGoal(),
          targetDate: undefined,
        }

        cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
          cy.addGoalToPlan(plan.uuid, futureGoal)
          cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal()).then(goal => {
            cy.addStepToGoal(goal.uuid, DataGenerator.generateStep())
          })

          cy.visit(`/update-agree-plan`)
          cy.url().should('include', `/update-agree-plan`)
        })
        cy.checkAccessibility()
      })

      it('Display validation error if nothing is selected', () => {
        cy.get('.govuk-button').click()

        cy.contains('#agree-plan-radio-error', 'Select if they agree to the plan')
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
    })
  })

  describe('Submission behaviour', () => {
    const planOverview = new PlanOverview()
    beforeEach(() => {
      cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
        cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal()).then(goal => {
          cy.addStepToGoal(goal.uuid, DataGenerator.generateStep())
        })

        planOverview.agreePlanCouldNotAgree()
        cy.visit(`/update-agree-plan`)
      })
    })

    it('Submit successfully when Yes is selected', () => {
      cy.get('#agree-plan-radio').click()
      cy.get('.govuk-button').click()
      cy.url().should('satisfy', url => url.endsWith('/plan'))
      cy.get('.plan-header+p').contains('Sam agreed to their plan on')
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

      cy.url().should('satisfy', url => url.endsWith('/update-agree-plan'))
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
  })
})
