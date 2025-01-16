import { faker } from '@faker-js/faker'
import CreateGoal from '../pages/create-goal'

describe('Create a new Goal', () => {
  const createGoalPage = new CreateGoal()

  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('planDetails')
      cy.wrap(planDetails.oasysAssessmentPk).as('oasysAssessmentPk')
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
    })
  })

  describe('Security', () => {
    it('Should display authorisation error if user does not have READ_WRITE role', () => {
      cy.get<string>('@oasysAssessmentPk').then(oasysAssessmentPk => {
        cy.openSentencePlan(oasysAssessmentPk, 'READ_ONLY')
      })

      cy.visit(`/create-goal/accommodation`, { failOnStatusCode: false })
      cy.checkAccessibility(true, ['scrollable-region-focusable'])
    })
  })

  it('Checks the back link is correct', () => {
    createGoalPage.createGoal('accommodation')
    cy.get('.govuk-back-link').should('have.attr', 'href', '/plan?type=current')
    cy.checkAccessibility()
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
      .should('contain', 'Date must be today or in the future')
    cy.contains('#related-area-of-need-radio-error', 'Select yes if this goal is related to any other area of need')
    cy.contains('.moj-datepicker', 'Date must be today or in the future')
    cy.title().should('contain', 'Error:')
    cy.checkAccessibility()
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
    cy.checkAccessibility()
  })

  it('Creates a new goal without steps with padded target date field', () => {
    createGoalPage.createGoal('accommodation')
    createGoalPage.selectGoalAutocompleteOption('I w', 'I will comply with the conditions of my tenancy agreement')
    createGoalPage.selectRelatedAreasOfNeedRadio('no')
    createGoalPage.selectStartWorkingRadio('yes')
    createGoalPage.selectAchievementDateSomethingElse('  4/4/3036')
    createGoalPage.clickButton('Save without steps')

    cy.url().should('contain', '/plan?status=added&type=current')
    cy.get('#goal-list').children().should('have.length', 1)
    cy.checkAccessibility()
  })

  it('Creates a new goal - checking back links work as expected', () => {
    createGoalPage.createGoal('accommodation')
    createGoalPage.selectGoalAutocompleteOption('I w', 'I will comply with the conditions of my tenancy agreement')
    createGoalPage.selectRelatedAreasOfNeedRadio('no')
    createGoalPage.selectStartWorkingRadio('yes')
    createGoalPage.selectAchievementDateSomethingElse('4/4/3036')
    createGoalPage.clickButton('Add steps')

    cy.url().should('contain', '/add-steps?type=current')

    cy.get('.govuk-back-link').should('have.attr', 'href').and('include', '/change-goal')
    cy.get('.govuk-back-link').click()
    cy.get('.govuk-back-link').should('have.attr', 'href').and('include', '/plan')

    cy.checkAccessibility()
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
    cy.checkAccessibility()
  })
})
