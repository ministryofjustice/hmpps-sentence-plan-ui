describe('Unsaved information deleted', () => {
  before(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('plan')
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
    })
  })

  describe('session timeout modal', () => {
    beforeEach(() => {
      cy.clock()
      cy.visit('/plan')
      cy.clock().tick(50 * 60 * 1000) // 50 minutes in milliseconds.
    })

    it('Should render session timeout modal with correct content wording', () => {
      cy.get('#hmrc-timeout-heading').should('exist').should('contain', 'Your unsaved information will be deleted soon')
      cy.get('#hmrc-timeout-dialog')
        .should('exist')
        .should(
          'contain',
          'We will delete any unsaved information if you do not continue in the next 10 minutes. This is to protect your information.',
        )
      cy.get('#hmrc-timeout-keep-signin-btn').should('exist').should('contain', 'Continue using sentence plan')
      cy.get('#hmrc-timeout-sign-out-link').should('exist').should('contain', 'Delete unsaved information')
    })

    it('Should change the timeout modal dialog text content to reflect time passing', () => {
      cy.clock().tick(5 * 60 * 1000) // 5 minutes in milliseconds.
      cy.get('#hmrc-timeout-dialog').should(
        'contain',
        'We will delete any unsaved information if you do not continue in the next 5 minutes. This is to protect your information.',
      )
    })

    it('Should close the timeout modal when Continue using sentence plan button is clicked', () => {
      cy.get('#hmrc-timeout-keep-signin-btn').click()
      cy.get('#hmrc-timeout-heading').should('not.exist')
      cy.get('#hmrc-timeout-dialog').should('not.exist')
    })
  })
})
