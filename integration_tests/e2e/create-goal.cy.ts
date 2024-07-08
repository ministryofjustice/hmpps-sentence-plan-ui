const login = () => {
  cy.session('id', () => {
    cy.visit(Cypress.env('oaStubUrl'))
    cy.get('#target-service').select('localhost')
    cy.get('button').contains('Create handover link').click()
    cy.location('href').should('eq', 'http://localhost:7072/')
    cy.get('body > div a[role=button]').contains('Open').invoke('removeAttr', 'target').click()
    cy.location('href').should('eq', 'http://localhost:3000/about-pop')
  })
  // no visit here
}

describe('Create a new Goal', () => {
  beforeEach(() => {
    login()
  })

  it('Creates a new goal', () => {
    cy.visit('http://localhost:3000/about-pop')
    cy.location('href').should('eq', 'http://localhost:3000/about-pop')
    cy.get("body a[href='/create-goal/accommodation']").click()
    cy.location('href').should('eq', 'http://localhost:3000/create-goal/accommodation')
    cy.get('.govuk-radios').first().get('input[value="Accommodation Goal 3"]').click()
    cy.get('.govuk-radios').last().contains('In 6 months').click()
    cy.get('button').contains('Save and continue').click()
    cy.location('href').should('eq', 'http://localhost:3000/steps/create')
    cy.get('#step-name').click()
    cy.get('#step-name').type('This is the first step')
    cy.get('#actor').click()
    cy.get('#actor-2').click()
    cy.get('button').contains('Save and continue').click()
    cy.location('href').should('eq', 'http://localhost:3000/steps/create')
  })
})
