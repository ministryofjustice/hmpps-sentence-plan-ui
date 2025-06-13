describe('Unsaved information deleted', () => {
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
      cy.visit('/plan')
    })
    cy.visit('/unsaved-information-deleted')
  })

  it('Unsaved information deleted - base', () => {
    cy.compareSnapshot('base-page')
  })

  it('Plan overview - return to plan from unsaved information deleted', () => {
    cy.contains('a', 'Go to the plan').click()
    cy.compareSnapshot('return-to-plan-from-unsaved-information-deleted-page')
  })
})
