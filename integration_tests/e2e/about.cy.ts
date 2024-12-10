describe('Rendering', () => {
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('plan')
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
      cy.get('.moj-primary-navigation__container').contains('a', 'About').click()
      // cy.get(
      //   ':nth-child(4) > .govuk-accordion__controls > .govuk-accordion__show-all > .govuk-accordion__show-all-text',
      // ).click()
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
    cy.get(
      ':nth-child(4) > :nth-child(3) > .govuk-accordion__section-header > .govuk-accordion__section-heading > .govuk-accordion__section-button',
    )
      .find('#accordion-with-summary-sections-summary-2 > .govuk-accordion__section-summary-focus > .moj-badge')
      .contains('Risk of reoffending')
    cy.get(
      ':nth-child(5) > .govuk-accordion__section-header > .govuk-accordion__section-heading > .govuk-accordion__section-button',
    )
      .find('#accordion-with-summary-sections-summary-4 > .govuk-accordion__section-summary-focus > .moj-badge')
      .contains('Risk of reoffending')
    cy.get(
      ':nth-child(6) > .govuk-accordion__section-header > .govuk-accordion__section-heading > .govuk-accordion__section-button',
    )
      .find('#accordion-with-summary-sections-summary-5 > .govuk-accordion__section-summary-focus > .moj-badge')
      .contains('Risk of reoffending')
  })

  it('Should check if the hard-coded data for high-scoring areas are displayed correctly and in order', () => {
    cy.get(
      ':nth-child(4) > .govuk-accordion__controls > .govuk-accordion__show-all > .govuk-accordion__show-all-text',
    ).click()
    cy.get(':nth-child(4) > :nth-child(3) > #accordion-default-content-2 > :nth-child(1)').contains(
      'This area is not linked to RoSH (risk of serious harm)',
    )
    cy.get('#accordion-default-content-1 > .motivation > .govuk-heading-s ').contains(
      'Motivation to make changes in this area',
    )
    cy.get('#accordion-default-content-1 > .motivation > .govuk-body').contains(
      'Sam wants to make changes but needs help.',
    )
    cy.get(':nth-child(4) > :nth-child(2) > #accordion-default-content-1 > :nth-child(4)').contains(
      'There are no strengths or protective factors related to this area',
    )
    cy.get('#accordion-default-content-1 > :nth-child(5) > .govuk-heading-s').contains(
      'Thinking, behaviours and attitudes need score',
    )
    cy.get('#accordion-default-content-1 > :nth-child(5) > p.govuk-body').contains(
      '10 out of 10. (Scores above 2 are high-scoring.)',
    )
    cy.get(
      '#accordion-default-content-1 > :nth-child(5) > .govuk-grid-row > .govuk-grid-column-full > .needs-score > .needs-score-label-wrapper > .needs-score-label__card > h3',
    ).contains('10')
    cy.get(
      '#accordion-default-content-1 > :nth-child(5) > .govuk-grid-row > .govuk-grid-column-full > .needs-score > .needs-score-label-wrapper > .needs-score-label__card > p',
    ).contains('out of 10')
    cy.get(':nth-child(7) > .govuk-heading-s').contains('Lifestyle and associates need score')
    cy.get(':nth-child(7) > p.govuk-body').contains('6 out of 6. (Scores above 1 are high-scoring.)')
    cy.get(
      ':nth-child(7) > .govuk-grid-row > .govuk-grid-column-full > .needs-score > .needs-score-label-wrapper > .needs-score-label__card > h3',
    ).contains('6')
    cy.get(
      ':nth-child(7) > .govuk-grid-row > .govuk-grid-column-full > .needs-score > .needs-score-label-wrapper > .needs-score-label__card > p',
    ).contains('out of 6')
    cy.get(':nth-child(4) > :nth-child(2) > #accordion-default-content-1')
      .find(':nth-child(9) > .goal-link > .govuk-link')
      .contains('Create thinking, behaviours and attitudes goal')
  })
})
