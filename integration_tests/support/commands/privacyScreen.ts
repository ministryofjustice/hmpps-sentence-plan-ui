import URLs from '../../../server/routes/URLs'

// eslint-disable-next-line import/prefer-default-export
export const handleDataPrivacyScreen = () => {
  cy.url().then(url => {
    if (url.includes(URLs.DATA_PRIVACY)) {
      cy.get('.govuk-checkboxes').click()
      cy.get('.govuk-button').click()
      cy.url().should('include', URLs.PLAN_OVERVIEW)
    }
  })
}
