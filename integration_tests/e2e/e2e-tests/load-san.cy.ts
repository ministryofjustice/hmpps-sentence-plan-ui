import PlanOverview from '../../pages/plan-overview'

describe('View SAN for READ_WRITE user', () => {
  beforeEach(() => {
    cy.createAssessment().enterAssessment()
  })

  it('Loads initial SAN page', () => {
    cy.visit('http://localhost:3000/start')
  })
})
