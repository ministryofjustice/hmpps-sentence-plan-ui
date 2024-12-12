describe('Rendering', () => {
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('plan')
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
      cy.get('.moj-primary-navigation__container').contains('a', 'About').click()
      cy.get(
        ':nth-child(4) > .govuk-accordion__controls > .govuk-accordion__show-all > .govuk-accordion__show-all-text',
      ).click()
    })
  })

  it('Should check the page rendered correctly', () => {
    cy.url().should('include', '/about')
    cy.get('h1').should('include.text', 'About')
    cy.get('h2').contains('Sentence information')
    cy.get('h2').contains('High-scoring areas from the assessment')
    cy.get('.govuk-body-s')
      .invoke('text')
      .then(text => {
        expect(text).to.include('Sentence')
        expect(text).to.include('Expected end date')
        expect(text).to.include('Unpaid work')
        expect(text).to.include('RAR (Rehabilitation activity requirement)')
      })
  })

  it('Should check if the hard-coded entries in Sentence information are displayed correctly', () => {
    cy.get('tbody > :nth-child(2) > :nth-child(1)').contains('Custodial Sentence (4 years, 2 months and 6 days)') // this will select the first cell in the first row
    cy.get('tbody > :nth-child(2) > :nth-child(2)').contains('12 January 2029')
    cy.get('tbody > :nth-child(2) > :nth-child(3)').contains('10 hours')
    cy.get('tbody > :nth-child(2) > :nth-child(4)').contains('3 days')
  })

  it('Should check if main titles of hard-coded high-scoring areas from the assessment are displayed correctly and in order with the correct risk marker', () => {
    const expectedText = [
      'Thinking, behaviours and attitudes',
      'Accommodation',
      'Personal relationships and community',
      'Alcohol use',
      'Employment and education',
      'Drug use',
      'Finances',
      'Health and wellbeing',
    ]
    cy.get('.govuk-accordion__section-heading-text-focus')
      .then($red => $red.toArray().map(el => el.innerText.trim())) // trim whitespace
      .should('deep.equal', expectedText)
  })

  it('Should check the hard-coded labels appear next to the correct, predetermined areas in correct order', () => {
    cy.get('.govuk-accordion__section-summary-focus').eq(1).contains('Risk of reoffending')
    cy.get('.govuk-accordion__section-summary-focus').eq(3).contains('Risk of reoffending')
    cy.get('.govuk-accordion__section-summary-focus').eq(4).contains('Risk of reoffending')
  })

  it('Should check all hard-coded links in each assessment section are in the expected order', () => {
    cy.get('p.goal-link')
      .eq(0)
      .contains('Create thinking, behaviours and attitudes goal')
      .should('have.attr', 'href')
      .and('include', '/create-goal/thinking-behaviours-and-attitudes')
    cy.get('p.goal-link')
      .eq(1)
      .contains('Create accommodation goal')
      .should('have.attr', 'href')
      .and('include', '/create-goal/accommodation')
    cy.get('p.goal-link')
      .eq(2)
      .contains('Create personal relationships and community goal')
      .should('have.attr', 'href')
      .and('include', '/create-goal/personal-relationships-and-community')
    cy.get('p.goal-link')
      .eq(3)
      .contains('Create alcohol use goa')
      .should('have.attr', 'href')
      .and('include', '/create-goal/alcohol-use')
    cy.get('p.goal-link')
      .eq(4)
      .contains('Create employment and education goal')
      .should('have.attr', 'href')
      .and('include', '/create-goal/employment-and-education')
    cy.get('p.goal-link')
      .eq(5)
      .contains('Create drug use goal')
      .should('have.attr', 'href')
      .and('include', '/create-goal/drug-use')
    cy.get('p.goal-link')
      .eq(6)
      .contains('Create finances goal')
      .should('have.attr', 'href')
      .and('include', '/create-goal/finances')
    cy.get('p.goal-link')
      .eq(7)
      .contains('Create health and wellbeing goal')
      .should('have.attr', 'href')
      .and('include', '/create-goal/health-and-wellbeing')
  })

  it('Should check if the hard-coded data for high-scoring areas are displayed correctly and in order', () => {
    cy.get('h3.govuk-heading-s').eq(0).contains('This area is not linked to RoSH (risk of serious harm)')
    cy.get('h3.govuk-heading-s').eq(1).contains('This area is not linked to risk of reoffending')
    cy.get('div.motivation')
      .eq(0)
      .contains('Motivation to make changes in this area Sam wants to make changes but needs help.')
    cy.get('h3.govuk-heading-s').eq(3).contains('There are no strengths or protective factors related to this area')
    cy.get('h3.govuk-heading-s').eq(4).contains('Thinking, behaviours and attitudes need score')
    cy.get('p.govuk-body').eq(2).contains('10 out of 10. (Scores above 2 are high-scoring')
    cy.get('.needs-score-label__card').eq(0).contains('10 out of 10')
    cy.get('h3.govuk-heading-s').eq(5).contains('Lifestyle and associates need score')
    cy.get('p.govuk-body').eq(3).contains('6 out of 6. (Scores above 1 are high-scoring.)')
    cy.get('.needs-score-label__card').eq(1).contains('6 out of 6')
  })
})
