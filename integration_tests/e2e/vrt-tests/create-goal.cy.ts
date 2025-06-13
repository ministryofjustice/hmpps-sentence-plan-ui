describe('Create goal', () => {
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
      cy.visit('/plan')
    })
    cy.contains('a', 'Create goal').click()
  })

  it('Create goal - accommodation', () => {
    cy.compareSnapshot('accommodation-page')
  })

  it('Create goal - accommodation error validation', () => {
    cy.get('button').contains('Add steps').click()
    cy.compareSnapshot('accommodation-error-validation-page')
  })

  it('Create goal - employment and education', () => {
    cy.get('.moj-side-navigation__list').contains('a', 'Employment and education').click()
    cy.compareSnapshot('employment-and-education-page')
  })

  it('Create goal - employment and education error validation', () => {
    cy.get('.moj-side-navigation__list').contains('a', 'Employment and education').click()
    cy.get('button').contains('Add steps').click()
    cy.compareSnapshot('employment-and-education-error-validation-page')
  })

  it('Create goal - finances', () => {
    cy.get('.moj-side-navigation__list').contains('a', 'Finances').click()
    cy.compareSnapshot('finances-page')
  })

  it('Create goal - finances error validation', () => {
    cy.get('.moj-side-navigation__list').contains('a', 'Finances').click()
    cy.get('button').contains('Add steps').click()
    cy.compareSnapshot('finances-error-validation-page')
  })

  it('Create goal - drug use', () => {
    cy.get('.moj-side-navigation__list').contains('a', 'Drug use').click()
    cy.compareSnapshot('drug-use-page')
  })

  it('Create goal - drug use error validation', () => {
    cy.get('.moj-side-navigation__list').contains('a', 'Drug use').click()
    cy.get('button').contains('Add steps').click()
    cy.compareSnapshot('drug-use-error-validation-page')
  })

  it('Create goal - alcohol use', () => {
    cy.get('.moj-side-navigation__list').contains('a', 'Alcohol use').click()
    cy.compareSnapshot('alcohol-use-page')
  })

  it('Create goal - alcohol use error validation', () => {
    cy.get('.moj-side-navigation__list').contains('a', 'Alcohol use').click()
    cy.get('button').contains('Add steps').click()
    cy.compareSnapshot('alcohol-use-error-validation-page')
  })

  it('Create goal - health and wellbeing', () => {
    cy.get('.moj-side-navigation__list').contains('a', 'Health and wellbeing').click()
    cy.compareSnapshot('health-and-wellbeing-page')
  })

  it('Create goal - health and wellbeing error validation', () => {
    cy.get('.moj-side-navigation__list').contains('a', 'Health and wellbeing').click()
    cy.get('button').contains('Add steps').click()
    cy.compareSnapshot('health-and-wellbeing-error-validation-page')
  })

  it('Create goal - personal relationships and community', () => {
    cy.get('.moj-side-navigation__list').contains('a', 'Personal relationships and community').click()
    cy.compareSnapshot('personal-relationships-and-community-page')
  })

  it('Create goal - personal relationships and community error validation', () => {
    cy.get('.moj-side-navigation__list').contains('a', 'Personal relationships and community').click()
    cy.get('button').contains('Add steps').click()
    cy.compareSnapshot('personal-relationships-and-community-error-validation-page')
  })

  it('Create goal - thinking behaviours and attitude', () => {
    cy.get('.moj-side-navigation__list').contains('a', 'Thinking, behaviours and attitude').click()
    cy.compareSnapshot('thinking-behaviours-and-attitude-page')
  })

  it('Create goal - thinking behaviours and attitude error validation', () => {
    cy.get('.moj-side-navigation__list').contains('a', 'Thinking, behaviours and attitude').click()
    cy.get('button').contains('Add steps').click()
    cy.compareSnapshot('thinking-behaviours-and-attitude-error-validation-page')
  })
})
