import { faker } from '@faker-js/faker'
import CreateGoal from '../pages/create-goal'

describe('Create a new Goal', () => {
  const createGoalPage = new CreateGoal()

  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('planDetails')
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
    })
  })

  it('Checks the back link is correct', () => {
    createGoalPage.createGoal('accommodation')
    cy.get('.govuk-back-link').should('have.attr', 'href', '/plan?type=current')
  })

  it('Creates a new goal with errors', () => {
    createGoalPage.createGoal('accommodation')
    createGoalPage.selectGoalAutocompleteOption('I w', 'I will comply with the conditions of my tenancy agreement')
    createGoalPage.selectStartWorkingRadio('yes')
    createGoalPage.selectAchievementDateSomethingElse('{backspace}')
    createGoalPage.clickButton('Add steps')

    cy.url().should('include', '/create-goal/accommodation')
    cy.get('.govuk-error-summary')
      .should('contain', 'Select yes if this goal is related to any other area of need')
      .should('contain', 'Select a date')
    cy.contains('#related-area-of-need-radio-error', 'Select yes if this goal is related to any other area of need')
    cy.contains('.hmpps-datepicker', 'Select a date')
    cy.title().should('contain', 'Error:')
  })

  it('Creates a new goal with errors', () => {
    const lorem = faker.lorem.paragraphs(40).replace(/(\r\n|\n|\r)/gm, '')
    createGoalPage.createGoal('accommodation')
    createGoalPage.putGoalAutoCompletionText(lorem)
    createGoalPage.selectRelatedAreasOfNeedRadio('yes')
    createGoalPage.selectRelatedAreasOfNeed(['Employment and education', 'Drug use'])
    createGoalPage.selectStartWorkingRadio('yes')
    createGoalPage.selectAchievementDate('In 6 months')
    createGoalPage.clickButton('Add steps')

    cy.url().should('include', '/create-goal/accommodation')
    cy.get('.govuk-error-summary').should('contain', 'Goal must be 4,000 characters or less')
    cy.get('#goal-input-error').should('contain', 'Goal must be 4,000 characters or less')
    cy.title().should('contain', 'Error:')

    cy.get('#goal-input-autocomplete').invoke('val').should('contain', lorem)
  })

  it('Creates a new goal without steps', () => {
    createGoalPage.createGoal('accommodation')
    createGoalPage.selectGoalAutocompleteOption('I w', 'I will comply with the conditions of my tenancy agreement')
    createGoalPage.selectRelatedAreasOfNeedRadio('yes')
    createGoalPage.selectRelatedAreasOfNeed(['Employment and education', 'Drug use'])
    createGoalPage.selectStartWorkingRadio('yes')
    createGoalPage.selectAchievementDate('In 6 months')
    createGoalPage.clickButton('Save without steps')

    cy.url().should('contain', '/plan?status=added&type=current')
    cy.get('#goal-list').children().should('have.length', 1)

    cy.get('#goal-list')
      .children()
      .first()
      .within(() => {
        cy.get('.govuk-summary-card__title').should(
          'contain',
          'I will comply with the conditions of my tenancy agreement',
        )
        cy.get('.goal-summary-card__areas-of-need').should('contain', 'Area of need: accommodation')
        cy.get('.goal-summary-card__areas-of-need').should(
          'contain',
          'Also relates to: drug use, employment and education',
        )
      })
  })

  it.skip('Should have no accessibility violations', () => {
    cy.checkAccessibility()
  })
})
