describe('Agree plan', () => {
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('plan')
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
      cy.get('.govuk-button').contains('Agree plan').click()
    })
  })

  describe('Rendering', () => {
    it('Display agree plan page correctly on load', () => {
      cy.get('.govuk-heading-l').contains('agree to this plan?')
      cy.get('.govuk-label').contains('Yes')
      cy.get('.govuk-label').contains('No')
      cy.get('.govuk-label').contains('could not answer this question')
      cy.get('.govuk-label').contains('Add any notes (optional)')
      cy.get('.govuk-button').contains('Agree plan with')
    })

    describe('Validation behaviour', () => {
      it('Display validation error if nothing is selected', () => {
        cy.get('.govuk-button').click()

        cy.contains('#agree-plan-radio-error', 'Select if they agree to the plan')
        cy.title().should('contain', 'Error:')
      })
      it('Display validation error if No is selected but no details provided', () => {
        cy.get('#agree-plan-radio-2').click()
        cy.get('.govuk-button').click()

        cy.contains('#does-not-agree-details-error', 'Enter details about why they do not agree')
        cy.title().should('contain', 'Error:')
      })
      it('Display validation error if Not answered is selected but no details provided', () => {
        cy.get('#agree-plan-radio-3').click()
        cy.get('.govuk-button').click()

        cy.contains('#could-not-answer-details-error', 'Enter details about why they cannot answer')
        cy.title().should('contain', 'Error:')
      })
    })

    describe('Submission behaviour', () => {
      it('Submit successfully when Yes is selected and additional notes provided', () => {
        cy.get('#agree-plan-radio').click()
        cy.get('#notes').type('abc')

        cy.get('.govuk-button').click()

        cy.url().should('include', '/plan-summary')
      })
      it('Submit successfully when No is selected and additional information provided', () => {
        cy.get('#agree-plan-radio-2').click()
        cy.get('#does-not-agree-details').type('abc')

        cy.get('.govuk-button').click()

        cy.url().should('include', '/plan-summary')
      })
      it('Submit successfully when "Could not answer this question" is selected and additional information provided', () => {
        cy.get('#agree-plan-radio-3').click()
        cy.get('#could-not-answer-details').type('abc')

        cy.get('.govuk-button').click()

        cy.url().should('include', '/plan-summary')
      })
    })
  })
})
