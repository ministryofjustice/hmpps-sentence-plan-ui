describe('Session timeout', () => {
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('plan')
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
    })
    cy.clock()
    cy.visit('/plan')
    cy.clock().tick(50 * 60 * 1000) // 50 minutes in milliseconds.
  })

  describe('session timeout modal', () => {
    it('Should render session timeout modal with correct content wording', () => {
      cy.get('#hmrc-timeout-heading').should('exist').should('contain', 'Your session is about to expire')
      cy.get('#hmrc-timeout-dialog')
        .should('exist')
        .should('contain', 'For your security, your session will expire in 10 minutes.')
      cy.get('#hmrc-timeout-keep-signin-btn').should('exist').should('contain', 'Extend session')
      cy.get('#hmrc-timeout-sign-out-link').should('exist').should('contain', 'End session')
    })

    it('Should change the timeout modal text to reflect 5 minutes remaining of session timeout counter', () => {
      cy.clock().tick(5 * 60 * 1000) // 5 minutes in milliseconds.
      cy.get('#hmrc-timeout-dialog').should('contain', 'For your security, your session will expire in 5 minutes.')
    })

    it('Should change the timeout modal text to reflect 1 minute remaining of session timeout counter', () => {
      cy.clock().tick(9 * 60 * 1000) // 9 minutes in milliseconds.
      cy.get('#hmrc-timeout-dialog').should('contain', 'For your security, your session will expire in 1 minute.')
    })

    it('Should change the timeout modal text to reflect 30 seconds remaining of session timeout counter', () => {
      cy.clock().tick(9.5 * 60 * 1000) // 9 minutes and 30 seconds in milliseconds.
      cy.get('#hmrc-timeout-dialog').should('contain', 'For your security, your session will expire in 30 seconds.')
    })

    it(`Should close the timeout modal when 'Extend session' button is clicked`, () => {
      cy.get('#hmrc-timeout-keep-signin-btn').click()
      cy.get('#hmrc-timeout-heading').should('not.exist')
    })

    it(`Should destroy the session when 'End session' is clicked`, () => {
      cy.get('#hmrc-timeout-sign-out-link').click()
      cy.url().should('include', '/plan')
      cy.get('h1').should('exist').contains('You need to sign in to use this service')
      cy.get('p')
        .contains('This could be because you’ve used a bookmarked link, or your session has expired due to inactivity.')
        .should('exist')
      cy.get('li').contains('Go to the OASys homepage to sign-in').should('exist')
      cy.get('li').contains('Go to the Manage People on Probation service to sign-in').should('exist')
    })

    it('Should destroy the session when session has expired', () => {
      cy.clock().tick(10 * 60 * 1000) // 10 minutes in milliseconds.
      cy.url().should('include', '/plan')
      cy.get('h1').should('exist').contains('You need to sign in to use this service')
      cy.get('p')
        .contains('This could be because you’ve used a bookmarked link, or your session has expired due to inactivity.')
        .should('exist')
      cy.get('li').contains('Go to the OASys homepage to sign-in').should('exist')
      cy.get('li').contains('Go to the Manage People on Probation service to sign-in').should('exist')
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

    it('Should render the 401 page', () => {
      cy.visit('/plan', { failOnStatusCode: false })
      cy.get('h1').should('exist').contains('You need to sign in to use this service')
      cy.get('p')
        .contains('This could be because you’ve used a bookmarked link, or your session has expired due to inactivity.')
        .should('exist')
      cy.get('li').contains('Go to the OASys homepage to sign-in').should('exist')
      cy.get('li').contains('Go to the Manage People on Probation service to sign-in').should('exist')
    })
  })
})
