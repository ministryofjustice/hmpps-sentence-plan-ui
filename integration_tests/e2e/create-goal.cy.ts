const login = () => {
  cy.session('id', () => {
    cy.visit(Cypress.env('oaStubUrl'))
    cy.get('#target-service').select('localhost')
    cy.get('button').contains('Create handover link').click()
    cy.location('href').should('eq', Cypress.env('oaStubUrl'))
    cy.get('body > div a[role=button]').contains('Open').invoke('removeAttr', 'target').click()
    cy.location('href').should('contain', '/about-pop')
  })
}

describe('Create a new Goal', () => {
  beforeEach(() => {
    login()
  })

  it('Creates a new goal', () => {
    cy.visit('/about-pop')
    cy.location('href').should('eq', `${Cypress.config().baseUrl}/about-pop`)
    cy.get("body a[href='/create-goal/accommodation']").click()
    cy.location('href').should('contain', '/create-goal/accommodation')
    cy.get('.govuk-radios').first().get('input[value="Accommodation Goal 3"]').click()
    cy.get('.govuk-radios').last().contains('In 6 months').click()
    cy.get('button').contains('Save and continue').click()
    cy.location('href').should('contain', '/steps/create')
    cy.get('#step-name').click()
    cy.get('#step-name').type('This is the first step')
    cy.get('#actor').click()
    cy.get('#actor-2').click()
    cy.get('button').contains('Save and continue').click()
    cy.location('href').should('contain', '/steps/create')
  })
})
