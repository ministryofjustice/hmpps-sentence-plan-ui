import { AccessMode } from '../../../server/@types/SessionType'

describe('View SAN for READ_WRITE user', () => {
  let firstUserOasysPk = ''

  it('Loads initial SAN page', () => {
    cy.createAssessment().then(() => {
      firstUserOasysPk = Cypress.env('last_assessment').oasysAssessmentPk
      cy.enterAssessment(AccessMode.READ_WRITE, { oasysAssessmentPk: firstUserOasysPk })
    })

    cy.visit('http://localhost:3000/start')

    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('plan')
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
    })
  })
})
