describe('Visual comparison testing', () => {
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('plan')
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
      cy.visit('/plan')
    })
  })

  describe('Plan overview', () => {
    it('Plan overview page screenshot', () => {
      cy.compareSnapshot('plan-overview-page')
    })
  })

  describe('About', () => {
    it('About page screenshot', () => {
      cy.get('.moj-primary-navigation__container').contains('a', 'About').click()
      cy.compareSnapshot('about-page')
    })
  })

  describe('Create goal', () => {
    beforeEach(() => {
      cy.contains('a', 'Create goal').click()
    })

    it('Create goal - accommodation screenshot', () => {
      cy.get('.moj-side-navigation__list').contains('a', 'Accommodation').click()
      cy.compareSnapshot('create-goal-accommodation-page')
    })

    it('Create goal - employment and education screenshot', () => {
      cy.get('.moj-side-navigation__list').contains('a', 'Employment and education').click()
      cy.compareSnapshot('create-goal-employment-and-education-page')
    })

    it('Create goal - finances screenshot', () => {
      cy.get('.moj-side-navigation__list').contains('a', 'Finances').click()
      cy.compareSnapshot('create-goal-finances-page')
    })

    it('Create goal - drug use screenshot', () => {
      cy.get('.moj-side-navigation__list').contains('a', 'Drug use').click()
      cy.compareSnapshot('create-goal-drug-use-page')
    })
  })

  // describe('Plan History', () => {
  //   it('take plan history page screenshot', () => {
  //     cy.visit('/plan-history')
  //     cy.compareSnapshot('plan-history-page')
  //   })
  // })
})
