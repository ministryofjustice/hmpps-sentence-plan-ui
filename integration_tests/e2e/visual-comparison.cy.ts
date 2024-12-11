describe('Rendering of pages we can GET', () => {
  before(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('plan')
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
    })
  })

  it('take plan page screenshot', () => {
    cy.visit('/plan')
    cy.compareSnapshot('plan-page')
  })

  it('take create goal page screenshot', () => {
    cy.visit('/create-goal/accommodation')
    cy.compareSnapshot('create-goal-page')
  })

  it('take plan history page screenshot', () => {
    cy.visit('/plan-history')
    cy.compareSnapshot('plan-history-page')
  })

  it('take about page screenshot', () => {
    cy.visit('/about')
    cy.compareSnapshot('about-page')
  })
})
