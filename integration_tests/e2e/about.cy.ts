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

  it('Should check if the hard-coded entries are displayed correctly', () => {
    cy.get('tbody > :nth-child(2)')
      .invoke('text')
      .then(text => {
        expect(text).to.include('Custodial Sentence  (4 years, 2 months and 6 days)')
        expect(text).to.include('12 January 2029')
        expect(text).to.include('10 hours')
        expect(text).to.include('3 days')
      })
    cy.get('tbody > :nth-child(3)')
      .invoke('text')
      .then(text => {
        expect(text).to.include('ORA Community Order  (5 months and 29 days)')
        expect(text).to.include('18 May 2025')
        expect(text).to.include('No')
        expect(text).to.include('No')
      })
  })
})
