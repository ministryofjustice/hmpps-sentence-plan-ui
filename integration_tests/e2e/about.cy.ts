import DataGenerator from '../support/DataGenerator'

describe('Rendering', () => {
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('plan')
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
      cy.addGoalToPlan(planDetails.plan.uuid, DataGenerator.generateGoal()).then(goal => {
        cy.addStepToGoal(goal.uuid, DataGenerator.generateStep())
      })
      cy.get('.moj-primary-navigation__container').contains('a', 'About').click()
    })
  })

  it('Should check the page rendered correctly', () => {
    cy.url().should('include', '/about')
    cy.get('h1').should('include.text', 'About')
    cy.get('h2').contains('Sentence information')
    cy.get('h2').contains('High-scoring areas from the assessment')
    cy.get('.about-table-header')
      .invoke('text')
      .then(text => {
        expect(text).to.include('Sentence')
        expect(text).to.include('Expected end date')
        expect(text).to.include('Unpaid work')
        expect(text).to.include('RAR (Rehabilitation activity requirement)')
      })
  })
})
