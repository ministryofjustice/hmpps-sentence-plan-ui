// eslint-disable-next-line import/prefer-default-export
export const hasFeedbackLink = () => {
  const stubFeedbackUrl = 'http://localhost:9092/'

  cy.get('.govuk-phase-banner__text > .govuk-link').as('feedbackLink')

  cy.get('@feedbackLink').should('have.attr', 'target').and('equal', '_blank')

  cy.get('@feedbackLink').invoke('attr', 'target', '_self').click()

  cy.url().should('equal', stubFeedbackUrl)

  cy.go('back')
}
