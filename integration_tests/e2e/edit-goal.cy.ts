import { NewGoal } from '../../server/@types/NewGoalType'
import { PlanType } from '../../server/@types/PlanType'

describe('Change a goal', () => {
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('plan')
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
    })
  })

  describe('Rendering', () => {
    const goalData: NewGoal = {
      title: 'Test goal',
      areaOfNeed: 'Drug use',
      relatedAreasOfNeed: ['Health and wellbeing'],
      targetDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
    }

    it('Edit goal page populated correctly', () => {
      // Add goal and access remove page
      cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
        cy.addGoalToPlan(plan.uuid, goalData).then(goal => {
          cy.visit(`/edit-goal/${goal.uuid}`)
        })
      })

      // Check goal data is populated correctly
      cy.contains('#goal-input-autocomplete__option--0', goalData.title)
      cy.get('input[name="other-area-of-need-radio"]').should('be.checked').and('have.value', 'yes')
      cy.get('.govuk-checkboxes').first().contains('Accommodation').should('not.be.checked')
      cy.get('#other-area-of-need-6').should('be.checked')
      cy.get('input[name="start-working-goal-radio"]').should('be.checked').and('have.value', 'yes')
      cy.get('#date-selection-radio-3').should('be.checked')
    })

    it('Edit goal page display errors correctly', () => {
      // Add goal and access remove page
      cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
        cy.addGoalToPlan(plan.uuid, goalData).then(goal => {
          cy.visit(`/edit-goal/${goal.uuid}`)
        })
      })

      // Modify data
      cy.get('#other-area-of-need-6').uncheck()
      cy.contains('button', 'save').click()

      cy.get('.govuk-error-summary').should('contain', 'Select all related areas')
      cy.contains('#other-area-of-need-error', 'Select all related areas')
      cy.title().should('contain', 'Error:')
    })

    it('Should update goal data', () => {
      // Add goal and access remove page
      cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
        cy.addGoalToPlan(plan.uuid, goalData).then(goal => {
          cy.visit(`/edit-goal/${goal.uuid}`)
        })
      })

      // Modify data
      cy.get('#other-area-of-need-2').check()
      cy.contains('button', 'save').click()
      cy.url().should('include', '/plan-summary')

      // Check goal data is saved and rendered correctly
      cy.get('.goal-summary-card')
        .should('contain', goalData.title)
        .and('contain', `Aim to achieve in 6 months`)
        .and('contain', `Area of need: ${goalData.areaOfNeed.toLowerCase()}`)
        .and('contain', `Also relates to: employment and education, ${goalData.relatedAreasOfNeed[0].toLowerCase()}`)
    })
  })
})
