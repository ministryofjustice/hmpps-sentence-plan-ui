import { AccessMode } from '../../server/@types/Handover'

describe('Rendering READ_WRITE', () => {
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('plan')
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
      cy.get('.moj-primary-navigation__container').contains('a', 'About').click()
      cy.url().should('include', '/about')
    })
  })

  it('Should check the page rendered correctly', () => {
    cy.get('h1').should('include.text', 'About')
    cy.get('h2').eq(0).contains('Sentence information')
    cy.get('h2').eq(1).contains('High-scoring areas from the assessment')
    cy.get('[role="button"]').should('have.length', 2)
    cy.get('[role="button"]').eq(0).should('contain', 'Return to OASys')
    cy.get('[role="button"]').eq(1).should('contain', 'Create goal')

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
      'Accommodation',
      'Personal relationships and community',
      'Thinking, behaviours and attitudes',
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

    const areas = [
      { text: 'Create accommodation goal', href: 'accommodation' },
      { text: 'Create personal relationships and community goal', href: 'personal-relationships-and-community' },
      { text: 'Create thinking, behaviours and attitudes goal', href: 'thinking-behaviours-and-attitudes' },
      { text: 'Create alcohol use goal', href: 'alcohol-use' },
      { text: 'Create employment and education goal', href: 'employment-and-education' },
      { text: 'Create drug use goal', href: 'drug-use' },
      { text: 'Create finances goal', href: 'finances' },
      { text: 'Create health and wellbeing goal', href: 'health-and-wellbeing' },
    ]

    areas.forEach((area, index) => {
      cy.get('p.goal-link')
        .eq(index)
        .contains(area.text)
        .should('have.attr', 'href')
        .and('include', `/create-goal/${area.href}`)
    })
  })

  it('Should check if the data for (high-scoring area) thinking behaviour and attitudes are displayed correctly and in order', () => {
    const expectedHeadings =
      'This area is not linked to RoSH (risk of serious harm) ' +
      'This area is not linked to risk of reoffending ' +
      'Motivation to make changes in this area Sam wants to make changes but needs help. ' +
      'There are no strengths or protective factors related to this area ' +
      'Thinking, behaviours and attitudes need score ' +
      '1 out of 10. (Scores above 2 are high-scoring.) ' +
      '1 out of 10 ' +
      'Lifestyle and associates need score ' +
      '6 out of 6. (Scores above 1 are high-scoring.) ' +
      '6 out of 6 ' +
      'Create thinking, behaviours and attitudes goal'
    cy.get('.govuk-accordion__show-all').eq(0).click() // click show all in high-scoring assessment section
    cy.contains('.govuk-accordion__section', 'Thinking, behaviours and attitudes')
      .find('#accordion-default-content-3')
      .invoke('text')
      .then(text => {
        const trimText = text.trim().replace(/\s+/g, ' ') // regex to catch and replace excessive newlines to single whitespace
        expect(trimText).to.include(expectedHeadings)
      })
    cy.contains('.govuk-accordion__section', 'Thinking, behaviours and attitudes')
      .find('.govuk-heading-s')
      .should('have.length', 6)
    cy.contains('.govuk-accordion__section', 'Thinking, behaviours and attitudes')
      .find('.govuk-body')
      .should('have.length', 6)
  })

  it('Should check if the score graph for (high-scoring area) thinking behaviour and attitudes is displayed correctly', () => {
    cy.get('.govuk-accordion__show-all').eq(0).click()
    cy.contains('.assessment-score', 'Thinking, behaviours and attitudes need score')
      .find('.lowscoring')
      .should('have.length', 1)
    cy.contains('.assessment-score', 'Lifestyle and associates need score')
      .find('.highscoring')
      .should('have.length', 6)
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
    cy.get('.govuk-accordion__show-all').eq(1).click() // click show all in low-scoring assessment section
    cy.contains('.govuk-accordion__section', 'Drug use')
      .find('#accordion-default-content-1')
      .invoke('text')
      .then(text => {
        const trimText = text.trim().replace(/\s+/g, ' ') // regex to catch and replace excessive newlines to single whitespace
        expect(trimText).to.include(expectedHeadings)
      })
    cy.contains('.govuk-accordion__section', 'Drug use').find('.govuk-heading-s').should('have.length', 4)
    cy.contains('.govuk-accordion__section', 'Drug use').find('.govuk-body').should('have.length', 3)
  })

  it('Should check if the score graph for (low-scoring area) drug use is displayed correctly', () => {
    cy.get('.govuk-accordion__show-all').eq(1).click()
    cy.contains('.assessment-score', '0 out of 8').find('.highscoring').should('have.length', 0)
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
    cy.get('.govuk-accordion__show-all').eq(2).click() // click show all in non-scoring assessment section
    cy.contains('.govuk-accordion__section', 'Health and wellbeing')
      .find('#accordion-default-content-2')
      .invoke('text')
      .then(text => {
        const trimText = text.trim().replace(/\s+/g, ' ') // regex to catch and replace excessive newlines to single whitespace
        expect(trimText).to.include(expectedHeadings)
      })
    cy.contains('.govuk-accordion__section', 'Health and wellbeing').find('.govuk-heading-s').should('have.length', 5)
    cy.contains('.govuk-accordion__section', 'Health and wellbeing').find('.govuk-body').should('have.length', 2)
  })
})

describe('Rendering READ_ONLY', () => {
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('plan')
      cy.openSentencePlan(planDetails.oasysAssessmentPk, AccessMode.READ_ONLY)
      cy.get('.moj-primary-navigation__container').contains('a', 'About').click()
    })
  })

  it('Should check the page rendered correctly with no Create Goal button', () => {
    cy.get('h1').should('include.text', 'About')
    cy.get('h2').eq(0).contains('Sentence information')
    cy.get('h2').eq(1).contains('High-scoring areas from the assessment')
    cy.get('[role="button"]').should('have.length', 1)
    cy.get('[role="button"]').eq(0).should('contain', 'Return to OASys')
  })

  it('Should check there are no links to create goal', () => {
    cy.get('a[href]').each(link => {
      const href = link.attr('href')
      expect(href).not.to.contain('create-goal')
    })
  })
})
