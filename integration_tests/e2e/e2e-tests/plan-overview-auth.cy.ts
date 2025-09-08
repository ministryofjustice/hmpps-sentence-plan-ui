describe('Users with the role can access the plan', () => {
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.openSentencePlanAuth(planDetails.oasysAssessmentPk, { planUuid: planDetails.plan.uuid, crn: 'X775086', username: 'AUTH_ADM' })
    })
  })

  it('Shows Auth User in the header', () => {
    cy.get('.hmpps-header__account-details__sub-text').should('have.text', 'Auth User')
    cy.checkAccessibility()
  })
})
