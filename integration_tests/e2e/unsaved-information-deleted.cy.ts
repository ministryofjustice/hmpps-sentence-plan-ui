describe('Unsaved information deleted', () => {
  before(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('plan')
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
    })
  })

  beforeEach(() => {
    cy.clock()
    cy.visit('/plan')
    cy.clock().tick(50 * 60 * 1000) // 50 minutes in milliseconds.
  })

  describe('session timeout modal', () => {
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

    it('Should change the timeout modal text to reflect 5 minutes remaining of session timeout counter', () => {
      cy.clock().tick(5 * 60 * 1000) // 5 minutes in milliseconds.
      cy.get('#hmrc-timeout-dialog').should(
        'contain',
        'We will delete any unsaved information if you do not continue in the next 5 minutes. This is to protect your information.',
      )
    })

    it('Should change the timeout modal text to reflect 1 minute remaining of session timeout counter', () => {
      cy.clock().tick(9 * 60 * 1000) // 9 minutes in milliseconds.
      cy.get('#hmrc-timeout-dialog').should(
        'contain',
        'We will delete any unsaved information if you do not continue in the next 1 minute. This is to protect your information.',
      )
    })

    it('Should change the timeout modal text to reflect 30 seconds remaining of session timeout counter', () => {
      cy.clock().tick(9.5 * 60 * 1000) // 9 minutes and 30 seconds in milliseconds.
      cy.get('#hmrc-timeout-dialog').should(
        'contain',
        'We will delete any unsaved information if you do not continue in the next 30 seconds. This is to protect your information.',
      )
    })

    it(`Should close the timeout modal when 'Continue using sentence plan' button is clicked`, () => {
      cy.get('#hmrc-timeout-keep-signin-btn').click()
      cy.get('#hmrc-timeout-heading').should('not.exist')
    })

    it(`Should navigate to the unsaved information deleted page when 'Delete unsaved information' is clicked`, () => {
      cy.get('#hmrc-timeout-sign-out-link').click()
      cy.url().should('include', '/unsaved-information-deleted')
      cy.get('h1').should('exist').contains('Your unsaved information has been deleted')
    })

    it('Should navigate to the unsaved information deleted page when session has expired', () => {
      cy.clock().tick(10 * 60 * 1000) // 10 minutes in milliseconds.
      cy.url().should('include', '/unsaved-information-deleted')
      cy.get('h1').should('exist').contains('Your unsaved information has been deleted')
    })

    it('Should display the session timeout modal again if a user hits inactivity of 50 minutes after continuing a session', () => {
      cy.get('#hmrc-timeout-heading').should('exist')
      cy.get('#hmrc-timeout-keep-signin-btn').click()
      cy.get('#hmrc-timeout-heading').should('not.exist')
      cy.contains('a', 'Create goal').click()
      cy.url().should('include', '/create-goal/')
      cy.clock().tick(50 * 60 * 1000) // 50 minutes in milliseconds.
      cy.get('#hmrc-timeout-heading').should('exist')
    })
  })

  describe('session timeout page', () => {
    beforeEach(() => {
      cy.clock().tick(10 * 60 * 1000) // 10 minutes in milliseconds.
    })

    it('Should render the unsaved information deleted page with correct content', () => {
      cy.url().should('include', '/unsaved-information-deleted')
      cy.get('h1').should('exist').contains('Your unsaved information has been deleted')
      cy.get('p').should('exist').contains('This is to protect your information.')
      cy.get('p').should('exist').contains('You can return to the plan to start again.')
      cy.get('.govuk-button').should('exist').contains('Return to plan')
    })

    it(`Should navigate back to a subjects plan when 'Return to plan' button is clicked`, () => {
      cy.get('.govuk-button').contains('Return to plan').click()
      cy.url().should('include', '/plan')
      cy.get('.plan-header').should('exist')
    })
  })
})
