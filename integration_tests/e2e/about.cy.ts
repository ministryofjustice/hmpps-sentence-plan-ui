describe('Rendering', () => {
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('plan')
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
      cy.get('.moj-primary-navigation__container').contains('a', 'About').click()
    })
  })

  it('Should check the page rendered correctly', () => {
    cy.url().should('include', '/about')
    cy.get('h1').should('include.text', 'About')
    cy.get('h2').contains('Sentence information')
    cy.get('h2').contains('High-scoring areas from the assessment')
    cy.get('.govuk-body-s')
      .invoke('text')
      .then(text => {
        expect(text).to.include('Sentence')
        expect(text).to.include('Expected end date')
        expect(text).to.include('Unpaid work')
        expect(text).to.include('RAR (Rehabilitation activity requirement)')
      })
  })

  it('Should check if the hard-coded entries in Sentence information are displayed correctly', () => {
    cy.get('tbody > :nth-child(2) > :nth-child(1)').contains('Custodial Sentence (4 years, 2 months and 6 days)') // this will select the first cell in the first row
    cy.get('tbody > :nth-child(2) > :nth-child(2)').contains('12 January 2029')
    cy.get('tbody > :nth-child(2) > :nth-child(3)').contains('10 hours')
    cy.get('tbody > :nth-child(2) > :nth-child(4)').contains('3 days')
  })
})
