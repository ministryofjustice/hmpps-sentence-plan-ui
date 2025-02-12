import DataGenerator from '../support/DataGenerator'

describe('OASys Return Button Rendering', () => {
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('plan')
      cy.agreePlan(planDetails.plan.uuid)
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
      cy.addGoalToPlan(planDetails.plan.uuid, DataGenerator.generateGoal()).then(goal => {
        cy.addStepToGoal(goal.uuid, DataGenerator.generateStep())
      })
    })
  })

  it('Displays and references the button correctly on the plan overview page', () => {
    cy.url().should('include', '/plan')
    cy.get('.govuk-button--secondary').contains('Return to OASys')
    cy.get('.govuk-button--secondary').should('have.attr', 'href').and('not.be.empty')
    cy.checkAccessibility()
  })

  it('Displays and references the button correctly on the plan history page', () => {
    cy.get('.moj-primary-navigation__container').contains('Plan history').click()
    cy.get('h1').contains('Plan history')
    cy.get('.govuk-button--secondary').contains('Return to OASys')
    cy.get('.govuk-button--secondary').should('have.attr', 'href').and('not.be.empty')
    cy.checkAccessibility()
  })

  it('Displays and references the button correctly on the about page', () => {
    cy.visit('/about')
    cy.get('h1').should('include.text', 'About')
    cy.get('.govuk-button--secondary').contains('Return to OASys')
    cy.get('.govuk-button--secondary').should('have.attr', 'href').and('not.be.empty')
    cy.checkAccessibility()
  })
})
