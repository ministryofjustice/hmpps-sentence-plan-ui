describe('Rendering', () => {
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('plan')
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
      cy.get('.moj-primary-navigation__container').contains('a', 'About').click()
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
      .then($reduced => $reduced.toArray().map(el => el.innerText.trim())) // trim whitespace
      .should('deep.equal', expectedText)
  })

  it('Should check the hard-coded labels appear next to the correct, predetermined areas in correct order', () => {
    cy.get('.govuk-accordion__section-heading').contains('Accommodation').contains('Risk of reoffending')
    cy.get('.govuk-accordion__section-heading').contains('Alcohol use').contains('Risk of reoffending')
    cy.get('.govuk-accordion__section-heading').contains('Employment and education').contains('Risk of reoffending')
  })

  it('Should check all hard-coded links in each assessment section are in the expected order', () => {
    cy.get('.govuk-accordion__show-all').click({ multiple: true })
    cy.contains('.govuk-accordion__section', 'Thinking, behaviours and attitudes')
      .contains('Create thinking, behaviours and attitudes goal')
      .should('have.attr', 'href')
      .and('include', '/create-goal/thinking-behaviours-and-attitudes')
    cy.contains('.govuk-accordion__section', 'Accommodation')
      .contains('Create accommodation goal')
      .should('have.attr', 'href')
      .and('include', '/create-goal/accommodation')
    cy.contains('.govuk-accordion__section', 'Personal relationships and community')
      .contains('Create personal relationships and community goal')
      .should('have.attr', 'href')
      .and('include', '/create-goal/personal-relationships-and-community')
    cy.contains('.govuk-accordion__section', 'Alcohol use')
      .contains('Create alcohol use goal')
      .should('have.attr', 'href')
      .and('include', '/create-goal/alcohol-use')
    cy.contains('.govuk-accordion__section', 'Employment and education')
      .contains('Create employment and education goal')
      .should('have.attr', 'href')
      .and('include', '/create-goal/employment-and-education')
    cy.contains('.govuk-accordion__section', 'Drug use')
      .contains('Create drug use goal')
      .should('have.attr', 'href')
      .and('include', '/create-goal/drug-use')
    cy.contains('.govuk-accordion__section', 'Finances')
      .contains('Create finances goal')
      .should('have.attr', 'href')
      .and('include', '/create-goal/finances')
    cy.contains('.govuk-accordion__section', 'Health and wellbeing')
      .contains('Create health and wellbeing goal')
      .should('have.attr', 'href')
      .and('include', '/create-goal/health-and-wellbeing')
  })

  it('Should check if the data for (high-scoring area) thinking behaviour and attitudes are displayed correctly and in order', () => {
    const expectedHeadings =
      'This area is not linked to RoSH (risk of serious harm) ' +
      'This area is not linked to risk of reoffending ' +
      'Motivation to make changes in this area Sam wants to make changes but needs help. ' +
      'There are no strengths or protective factors related to this area ' +
      'Thinking, behaviours and attitudes need score ' +
      '10 out of 10. (Scores above 2 are high-scoring.) ' +
      '10 out of 10 ' +
      'Lifestyle and associates need score ' +
      '6 out of 6. (Scores above 1 are high-scoring.) ' +
      '6 out of 6 ' +
      'Create thinking, behaviours and attitudes goal'
    cy.get('.govuk-accordion__show-all').first().click() // click show all in high-scoring assessment section
    cy.contains('.govuk-accordion__section', 'Thinking, behaviours and attitudes')
      .find('#accordion-default-content-1')
      .invoke('text')
      .then(text => {
        const trimText = text.trim().replace(/\s+/g, ' ') // regex to catch and replace excessive newlines to single whitespace
        expect(trimText).to.include(expectedHeadings)
      })
  })

  it('Should check if the data for (low-scoring area) drug use are displayed correctly and in order', () => {
    const expectedHeadings =
      'This area is not linked to RoSH (risk of serious harm) ' +
      'This area is not linked to risk of reoffending ' +
      'There are no strengths or protective factors related to this area ' +
      'Drug use need score ' +
      '0 out of 8. (Scores above 0 are high-scoring.) ' +
      '0 out of 8 ' +
      'Create drug use goal'
    cy.get('.govuk-accordion__show-all').eq(1).click()
    cy.contains('.govuk-accordion__section', 'Drug use')
      .find('#accordion-default-content-1')
      .invoke('text')
      .then(text => {
        const trimText = text.trim().replace(/\s+/g, ' ') // regex to catch and replace excessive newlines to single whitespace
        expect(trimText).to.include(expectedHeadings)
      })
  })

  it('Should check if the data for (non-scoring area) health and wellbeing are displayed correctly and in order', () => {
    const expectedHeadings =
      'This area is not linked to RoSH (risk of serious harm) ' +
      'This area is not linked to risk of reoffending ' +
      'Motivation to make changes in this area ' +
      'This question was not applicable. ' +
      'There are no strengths or protective factors related to this area ' +
      'This area does not have a need score ' +
      'Create health and wellbeing goal'
    cy.get('.govuk-accordion__show-all').eq(2).click()
    cy.contains('.govuk-accordion__section', 'Health and wellbeing')
      .find('#accordion-default-content-2')
      .invoke('text')
      .then(text => {
        const trimText = text.trim().replace(/\s+/g, ' ') // regex to catch and replace excessive newlines to single whitespace
        expect(trimText).to.include(expectedHeadings)
      })
  })
})
