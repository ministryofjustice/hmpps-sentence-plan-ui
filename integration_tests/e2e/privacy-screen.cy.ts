import { AccessMode } from '../../server/@types/Handover'
import URLs from '../../server/routes/URLs'

describe('Privacy Screen', () => {
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('plan')
      cy.wrap(planDetails.oasysAssessmentPk).as('oasysAssessmentPk')
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
    })
  })

  describe('Security', () => {
    it('Should display authorisation error if user does not have READ_WRITE role', () => {
      cy.get<string>('@oasysAssessmentPk').then(oasysAssessmentPk => {
        cy.openSentencePlan(oasysAssessmentPk, { accessMode: AccessMode.READ_ONLY })
      })
      cy.visit(URLs.DATA_PRIVACY, { failOnStatusCode: false })
      cy.get('.govuk-body').should('contain', 'You do not have permission to perform this action')

      cy.checkAccessibility(true, ['scrollable-region-focusable'])
    })
  })

  describe('Confirming privacy declaration', () => {
    beforeEach(() => {
      cy.get<string>('@oasysAssessmentPk').then(oasysAssessmentPk => {
        cy.openSentencePlan(oasysAssessmentPk, { accessMode: AccessMode.READ_WRITE })
      })
      cy.visit(URLs.DATA_PRIVACY)
    })

    it('Has a feedback link', () => {
      cy.hasFeedbackLink()
    })

    it('Display privacy page correctly on load', () => {
      cy.get('button[value="confirm"]')
      cy.get('.moj-primary-navigation__container').should('not.exist')
      cy.get('.govuk-heading-l').contains(
        'Remember to close anything you do not need before starting an appointment with Sam',
      )
      cy.get('.govuk-body').contains('For example, Outlook, Teams or NDelius.')
      cy.get('.govuk-body').contains('You must do this to avoid sharing sensitive information.')
      cy.get('.govuk-checkboxes').contains("I confirm I'll close anything I do not need before starting an appointment")
      cy.get('.govuk-button').contains('Confirm')
      cy.contains('a', 'Return to OASys').should('have.attr', 'href').and('include', Cypress.env('OASTUB_URL'))
      cy.get('.govuk-back-link').should('have.attr', 'href').and('include', Cypress.env('OASTUB_URL'))
      cy.checkAccessibility()
    })

    it('Has validation errors when submitted without confirming checkbox', () => {
      cy.get('.govuk-button').click()
      cy.url().should('include', URLs.DATA_PRIVACY)
      cy.title().should('contain', 'Error:')
      cy.get('.govuk-error-summary').should(
        'contain',
        "Confirm you'll close anything you do not need before starting an appointment",
      )
      cy.get('#confirm-privacy-checkbox-error').should(
        'contain',
        "Confirm you'll close anything you do not need before starting an appointment",
      )
      cy.checkAccessibility()
    })

    it('submits the form when checkbox is selected and redirects to /plan', () => {
      cy.get('.govuk-checkboxes').click()
      cy.get('.govuk-button').click()
      cy.url().should('include', URLs.PLAN_OVERVIEW)
    })
  })
})
