import DataGenerator from '../support/DataGenerator'

describe('Rendering', () => {
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('plan')
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
  })

  it('Displays and references the button correctly on the plan history page', () => {
    cy.get('.moj-primary-navigation__container').contains('Plan history').click()
    cy.get('h1').contains('Plan history')
    cy.get('.plan-history-intro').should('include.text', "plan has been agreed, you'll be able to view updates here.")
    cy.get('.govuk-button--secondary').contains('Return to OASys')
    cy.get('.govuk-button--secondary').should('have.attr', 'href').and('not.be.empty')
  })
})
