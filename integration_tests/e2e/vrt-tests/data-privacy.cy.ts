describe('Data privacy', () => {
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
      cy.visit('/close-any-other-applications-before-appointment')
    })
  })

  it('Data privacy - base', () => {
    cy.compareSnapshot('base-page')
  })

  it('Data privacy - error validation', () => {
    cy.get('button').contains('Confirm').click()
    cy.compareSnapshot('base-error-validation-page')
  })

  it('Plan overview - agree to privacy statement and see a given plan', () => {
    cy.get('#confirm-privacy-checkbox').check()
    cy.get('button').contains('Confirm').click()
    cy.compareSnapshot('view-plan-after-agreeing-to-privacy-statement-page')
  })

  describe('User is authenticated via HMPPS Auth', () => {
    beforeEach(() => {
      cy.createSentencePlan().then(planDetails => {
        cy.wrap(planDetails).as('plan')
        cy.openSentencePlanAuth(planDetails.oasysAssessmentPk, {
          planUuid: planDetails.plan.uuid,
          crn: 'X775086',
          username: 'AUTH_ADM',
        })
      })
    })
    it('does not show the back link', () => {
      cy.get('.govuk-back-link').should('not.exist')
      cy.compareSnapshot('base-page-hmpps-auth')
    })
  })
})
