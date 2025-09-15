// eslint-disable-next-line import/prefer-default-export
export const hasPreviousVersionsPageLink = () => {
  const stubPreviousVersionsPageUrl = Cypress.env('PREVIOUS_VERSIONS_PAGE_URL')

  cy.get('.plan-header [data-previous-versions-link]').as('previousVersionsPageLink')
  cy.get('@previousVersionsPageLink').should('contain', `View previous versions`)

  cy.get('@previousVersionsPageLink').invoke('attr', 'target', '_self').click()
  cy.url().should('equal', stubPreviousVersionsPageUrl)

  cy.go('back')
}
