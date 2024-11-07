import { faker } from '@faker-js/faker'
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
    it('Change goal page populated correctly', () => {
      // Add goal and access change-goal page
      cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
        cy.addGoalToPlan(plan.uuid, goalData).then(goal => {
          cy.visit(`/change-goal/${goal.uuid}`)
        })
      })

      // Check goal data is populated correctly
      cy.contains('#goal-input-autocomplete__option--0', goalData.title)
      cy.get('input[name="related-area-of-need-radio"]').should('be.checked').and('have.value', 'yes')
      cy.get('.govuk-checkboxes').first().contains('Accommodation').should('not.be.checked')
      cy.get('input[value="Health and wellbeing"]').should('be.checked')
      cy.get('input[name="start-working-goal-radio"]').should('be.checked').and('have.value', 'yes')
      cy.get('#date-selection-radio-2').should('be.checked')
    })
  })

  describe('Validation behaviours', () => {
    it('Change goal page display errors correctly', () => {
      // Add goal and access change-goal page
      cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
        cy.addGoalToPlan(plan.uuid, goalData).then(goal => {
          cy.visit(`/change-goal/${goal.uuid}`)
        })
      })

      // Modify data
      cy.get('#related-area-of-need-5').uncheck()
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
          cy.visit(`/change-goal/${goal.uuid}`)
        })
      })
    })

    it('Should change goal title, related areas of need', () => {
      // Modify data
      cy.get('#goal-input-autocomplete').type('some goal')
      cy.get('input[value="Employment and education"]').check()
      cy.get('input[value="Alcohol use"]').check()

      cy.contains('button', 'save').click()
      cy.url().should('include', 'plan?status=updated&type=current')

      // Check goal data is saved and rendered correctly
      cy.get('.goal-summary-card')
        .should('contain', 'some goal')
        .and('contain', `Area of need: ${goalData.areaOfNeed.toLowerCase()}`)
        .and('contain', 'Also relates to: alcohol use, employment and education, health and wellbeing')
    })

    it('Should change goal with NO related areas of need', () => {
      // Modify data
      cy.get('#related-area-of-need-radio-2').check()

      cy.contains('button', 'save').click()
      cy.url().should('include', 'plan?status=updated&type=current')

      // Check goal data is saved and rendered correctly
      cy.get('.goal-summary-card').and('not.contain', 'Also relates to:')
    })

    it('Should change goal with related areas of need', () => {
      // Modify data
      cy.get('input[value="Employment and education"]').check()
      cy.get('input[value="Health and wellbeing"]').uncheck()

      cy.contains('button', 'save').click()
      cy.url().should('include', 'plan?status=updated&type=current')

      // Check goal data is saved and rendered correctly
      cy.get('.goal-summary-card').and('contain', 'Also relates to: employment and education')
    })

    it('Should change goal with standard date', () => {
      // Modify data
      cy.get('#date-selection-radio-2').check()

      cy.contains('button', 'save').click()
      cy.url().should('include', 'plan?status=updated&type=current')
    })

    it('Should change goal with custom date', () => {
      const twentyMonthsLaterISODate = new Date(new Date().setMonth(new Date().getMonth() + 20))
        .toISOString()
        .split('T')[0]
        .split('-')
      const date = `${twentyMonthsLaterISODate[2]}/${twentyMonthsLaterISODate[1]}/${twentyMonthsLaterISODate[0]}`
      // Modify data
      cy.get('label[for="date-selection-radio-5"]').should('contain', 'Set another date').click()
      cy.get('#date-selection-custom').type(date)
      cy.contains('button', 'save').click()
      cy.url().should('include', 'plan?status=updated&type=current')
    })

    it('Should change goal with future date', () => {
      // Modify data
      cy.get('label[for="start-working-goal-radio-2"]').should('contain', 'No, it is a future goal').click()

      cy.contains('button', 'save').click()
      cy.url().should('include', 'plan?status=updated&type=future')

      // Check goal data is saved and rendered correctly
      cy.get('.moj-sub-navigation').and('contain', 'Future goals (1)')
    })

    it('Should display error if goal title is too long', () => {
      const lorem = faker.lorem.paragraphs(40).replace(/(\r\n|\n|\r)/gm, '')
      // Modify data
      cy.get('#goal-input-autocomplete').invoke('val', lorem)
      cy.get('input[value="Employment and education"]').check()
      cy.get('input[value="Alcohol use"]').check()

      cy.contains('button', 'save').click()
      cy.url().should('include', '/change-goal')
      cy.get('.govuk-error-summary').should('contain', 'Goal must be 4,000 characters or less')
      cy.get('#goal-input-error').should('contain', 'Goal must be 4,000 characters or less')
      cy.get('#goal-input-autocomplete').invoke('val').should('contain', lorem)
    })
  })
})
