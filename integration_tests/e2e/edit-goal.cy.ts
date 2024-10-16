import { NewGoal } from '../../server/@types/NewGoalType'
import { PlanType } from '../../server/@types/PlanType'

describe('Change a goal', () => {
  const goalData: NewGoal = {
    title: 'Test goal',
    areaOfNeed: 'Drug use',
    relatedAreasOfNeed: ['Health and wellbeing'],
    targetDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
  }
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('plan')
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
    })
  })

  describe('Rendering', () => {
    it('Edit goal page populated correctly', () => {
      // Add goal and access remove page
      cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
        cy.addGoalToPlan(plan.uuid, goalData).then(goal => {
          cy.visit(`/edit-goal/${goal.uuid}`)
        })
      })

      // Check goal data is populated correctly
      cy.contains('#goal-input-autocomplete__option--0', goalData.title)
      cy.get('input[name="related-area-of-need-radio"]').should('be.checked').and('have.value', 'yes')
      cy.get('.govuk-checkboxes').first().contains('Accommodation').should('not.be.checked')
      cy.get('input[value="Health and wellbeing"]').should('be.checked')
      cy.get('input[name="start-working-goal-radio"]').should('be.checked').and('have.value', 'yes')
      cy.get('#date-selection-radio-3').should('be.checked')
    })
  })

  describe('Validation behaviours', () => {
    it('Edit goal page display errors correctly', () => {
      // Add goal and access remove page
      cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
        cy.addGoalToPlan(plan.uuid, goalData).then(goal => {
          cy.visit(`/edit-goal/${goal.uuid}`)
        })
      })

      // Modify data
      cy.get('#related-area-of-need-6').uncheck()
      cy.contains('button', 'save').click()

      cy.get('.govuk-error-summary').should('contain', 'Select all related areas')
      cy.contains('#related-area-of-need-error', 'Select all related areas')
      cy.title().should('contain', 'Error:')
    })
  })

  describe('Submission behaviours', () => {
    beforeEach(() => {
      cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
        cy.addGoalToPlan(plan.uuid, goalData).then(goal => {
          cy.visit(`/edit-goal/${goal.uuid}`)
        })
      })
    })

    it('Should update goal title, related areas of need', () => {
      // Modify data
      cy.get('#goal-input-autocomplete').type('some goal')
      cy.get('input[value="Employment and education"]').check()
      cy.get('input[value="Alcohol use"]').check()

      cy.contains('button', 'save').click()
      cy.url().should('include', '/plan')

      // Check goal data is saved and rendered correctly
      cy.get('.goal-summary-card')
        .should('contain', 'some goal')
        .and('contain', `Area of need: ${goalData.areaOfNeed.toLowerCase()}`)
        .and('contain', 'Also relates to: alcohol use, employment and education, health and wellbeing')
    })

    it('Should update goal with NO related areas of need', () => {
      // Modify data
      cy.get('#related-area-of-need-radio-2').check()

      cy.contains('button', 'save').click()
      cy.url().should('include', '/plan')

      // Check goal data is saved and rendered correctly
      cy.get('.goal-summary-card').and('not.contain', 'Also relates to:')
    })

    it('Should update goal with related areas of need', () => {
      // Modify data
      cy.get('input[value="Employment and education"]').check()
      cy.get('input[value="Health and wellbeing"]').uncheck()

      cy.contains('button', 'save').click()
      cy.url().should('include', '/plan')

      // Check goal data is saved and rendered correctly
      cy.get('.goal-summary-card').and('contain', 'Also relates to: employment and education')
    })

    it('Should update goal with standard date', () => {
      // Modify data
      cy.get('#date-selection-radio-2').check()

      cy.contains('button', 'save').click()
      cy.url().should('include', '/plan')
    })

    it('Should update goal with custom date', () => {
      const twentyMonthsLaterISODate = new Date(new Date().setMonth(new Date().getMonth() + 20))
        .toISOString()
        .split('T')[0]
        .split('-')
      const date = `${twentyMonthsLaterISODate[2]}/${twentyMonthsLaterISODate[1]}/${twentyMonthsLaterISODate[0]}`
      // Modify data
      cy.get('#date-selection-radio-7').check()
      cy.get('#date-selection-custom').type(date)
      cy.contains('button', 'save').click()
      cy.url().should('include', '/plan')
    })

    it('Should update goal with future date', () => {
      // Modify data
      cy.get('label[for="start-working-goal-radio-2"]').should('contain', 'No, it is a future goal').click()

      cy.contains('button', 'save').click()
      cy.url().should('include', '/plan')

      // Check goal data is saved and rendered correctly
      cy.get('.moj-sub-navigation').and('contain', 'Future goals (1)')
    })
  })
})
