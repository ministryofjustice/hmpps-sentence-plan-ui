export default class PlanSummary {
  getSummaryCard = (value: number) => {
    return cy.get('.govuk-summary-card').eq(value)
  }

  clickUpOnSummaryCard = (value: number) => {
    this.getSummaryCard(value).contains('.govuk-button', 'Move goal up').click()
  }

  clickDownOnSummaryCard = (value: number) => {
    this.getSummaryCard(value).contains('.govuk-button', 'Move goal down').click()
  }
}
