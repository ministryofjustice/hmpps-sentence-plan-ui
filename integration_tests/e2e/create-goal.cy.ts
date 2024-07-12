describe('Create a new Goal', () => {
  beforeEach(() => {
    cy.createSentencePlan()
    cy.enterSentencePlan()
  })

  it('Creates a new goal', () => {
    cy.url().should('include', '/about-pop')
    cy.get("a[href='/create-goal/accommodation']").click()
    cy.url().should('include', '/create-goal/accommodation')
    cy.get('.govuk-radios').first().get('input[value="Accommodation Goal 3"]').click()
    cy.get('.govuk-radios').last().contains('In 6 months').click()
    cy.get('button').contains('Save and continue').click()
    cy.url().should('include', '/steps/create')
    cy.get('#step-name').click()
    cy.get('#step-name').type('This is the first step')
    cy.get('#actor').click()
    cy.get('#actor-2').click()
    cy.get('button').contains('Save and continue').click()
    cy.url().should('include', '/steps/create')
  })
})
