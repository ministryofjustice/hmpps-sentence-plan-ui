import { AccessMode } from '../../server/@types/Handover'

describe('View Plan Overview for READ_ONLY user', () => {
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.openSentencePlan(planDetails.oasysAssessmentPk, AccessMode.READ_ONLY)
    })
  })

  it('Should have one button', () => {
    cy.visit('/plan')
    cy.get('button').should('have.length', 0)
    cy.get('[role="button"]').should('have.length', 1).and('contain', 'Return to OASys')
  })

  it('Visiting create-goal should fail', () => {
    cy.visit('/create-goal/accommodation')
    cy.url().should('include', '/plan')
  })

  it('Should have a `Return to OASys` button and it should return the user to the OASys return URL', () => {
    cy.contains('a', 'Return to OASys').should('have.attr', 'href').and('include', Cypress.env('OASTUB_URL'))
  })

  it.skip('Should have no accessibility violations', () => {
    cy.checkAccessibility()
  })
})
