export default class PlanSummary {
  getSummaryCard = (value: number) => {
    return cy.get('.govuk-summary-card').eq(value)
  }

  agreePlan = () => {
    cy.get('button').contains('Agree plan').click()
    cy.get('label').contains('Yes, ').click()
    cy.get('button').contains('Agree plan with').click()
  }

  clickUpOnSummaryCard = (value: number) => {
    this.getSummaryCard(value).contains('.govuk-button', 'Move goal up').click()
  }

  clickDownOnSummaryCard = (value: number) => {
    this.getSummaryCard(value).contains('.govuk-button', 'Move goal down').click()
  }
}
