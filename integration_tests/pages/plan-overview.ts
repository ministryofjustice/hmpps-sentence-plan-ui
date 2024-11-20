export default class PlanOverview {
  getSummaryCard = (value: number) => {
    return cy.get('.govuk-summary-card').eq(value)
  }

  agreePlan = () => {
    cy.get('button').contains('Agree plan').click()
    cy.get('label').contains('Yes, ').click()
    cy.get('textarea#notes').type('Reason to agree')
    cy.get('button').contains('Save').click()
  }

  agreePlanDidNotAgree = () => {
    cy.get('button').contains('Agree plan').click()
    cy.get('label').contains('No, I do not agree').click()
    cy.get('textarea#does-not-agree-details').type('Reason to not agree')
    cy.get('button').contains('Save').click()
  }

  agreePlanCouldNotAgree = () => {
    cy.get('button').contains('Agree plan').click()
    cy.get('label').contains('could not answer this question').click()
    cy.get('textarea#could-not-answer-details').type('Reason they could not agree')
    cy.get('button').contains('Save').click()
  }

  clickUpOnSummaryCard = (value: number) => {
    this.getSummaryCard(value).contains('.govuk-button', 'Move goal up').click()
  }

  clickDownOnSummaryCard = (value: number) => {
    this.getSummaryCard(value).contains('.govuk-button', 'Move goal down').click()
  }
}
