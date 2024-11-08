describe('Rendering', () => {
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('plan')
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
    })
    cy.visit('/plan-history')
  })

  it('Display plan history page correctly on load', () => {
    cy.get('h1').contains('Plan history')
  })
})
