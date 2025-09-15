import { AccessMode } from '../../../server/@types/Handover'

describe('Rendering About Person for READ_WRITE user', () => {
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('plan')
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
      cy.get('.moj-primary-navigation__container').contains('a', 'About').click()
      cy.url().should('include', '/about')
    })
  })

  it('Should check the page rendered correctly', () => {
    cy.get('.moj-primary-navigation__container').should('not.contain', `Plan history`)
    cy.get('h1').should('include.text', 'About')
    cy.get('h2.govuk-heading-m').eq(0).contains('Some areas have incomplete information')
    cy.get('h2').eq(1).contains('Sentence information')
    cy.get('h2').eq(2).contains('Incomplete information')
    cy.get('h2').eq(3).contains('High-scoring areas from the assessment')
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

    cy.checkAccessibility()
    cy.hasFeedbackLink()
  })

  it('Has a previous versions link', () => {
    cy.get('.plan-header__subject-details__navigation-links').should('contain', `View previous versions`)
  })

  it('Should check if the hard-coded entries in Sentence information are displayed correctly', () => {
    cy.get('tbody > :nth-child(2) > :nth-child(1)').contains('Custodial Sentence (4 years, 2 months and 6 days)') // this will select the first cell in the first row
    cy.get('tbody > :nth-child(2) > :nth-child(2)').contains('12 January 2029')
    cy.get('tbody > :nth-child(2) > :nth-child(3)').contains('10 hours')
    cy.get('tbody > :nth-child(2) > :nth-child(4)').contains('3 days')
  })

  it('Should check if titles of high-scoring areas are displayed in the right order', () => {
    const expectedText = [
      'Accommodation',
      'Alcohol use',
      'Employment and education',
      'Thinking, behaviours and attitudes',
    ]
    cy.get('#assessment-accordion-highScoring .govuk-accordion__section-heading-text-focus')
      .then($reduced => $reduced.toArray().map(el => el.innerText.trim())) // trim whitespace
      .should('deep.equal', expectedText)
  })

  it('Should check the hard-coded labels appear next to the correct areas', () => {
    // this is set to relLinkedToReoffending: 'YES', in backend.ts but doesn't display because the section is incomplete
    cy.get('#personal-relationships-and-community .moj-badge').should('not.exist')

    cy.get('#accommodation .moj-badge').should('have.length', 1)
    cy.get('#accommodation .moj-badge').contains('Risk of reoffending')

    cy.get('#thinking-behaviours-and-attitudes .moj-badge').should('not.exist')

    cy.get('#alcohol-use .moj-badge').should('have.length', 1)
    cy.get('#alcohol-use .moj-badge').contains('Risk of reoffending')

    cy.get('#employment-and-education .moj-badge').should('have.length', 1)
    cy.get('#employment-and-education .moj-badge').contains('Risk of reoffending')

    cy.get('#drug-use .moj-badge').should('not.exist')
    cy.get('#finances .moj-badge').should('not.exist')
    cy.get('#health-and-wellbeing .moj-badge').should('not.exist')
  })

  it('Should check links in each assessment section are in the expected order', () => {
    const areas = [
      { text: 'Create personal relationships and community goal', href: 'personal-relationships-and-community' },
      { text: 'Create accommodation goal', href: 'accommodation' },
      { text: 'Create alcohol use goal', href: 'alcohol-use' },
      { text: 'Create employment and education goal', href: 'employment-and-education' },
      { text: 'Create thinking, behaviours and attitudes goal', href: 'thinking-behaviours-and-attitudes' },
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

  it('Should check the Missing Information section in Personal Relationships and Community is displayed correctly', () => {
    cy.get('.govuk-inset-text').should('have.length', 2) // make sure there are only two missing information sections

    cy.get('#personal-relationships-and-community button').click() // click show all in Personal Relationships and Community assessment section
    cy.get('#personal-relationships-and-community .govuk-inset-text li').should('have.length', 1)
    cy.get('#personal-relationships-and-community .govuk-inset-text li')
      .eq(0)
      .contains('whether this area is linked to RoSH (risk of serious harm)')
  })

  it('Should check if the data for Thinking behaviour and attitudes are displayed correctly and in order', () => {
    const expectedHeadings = [
      'This area is not linked to RoSH (risk of serious harm)',
      'This area is not linked to risk of reoffending',
      'Motivation to make changes in this area',
      'There are no strengths or protective factors related to this area',
      'Thinking, behaviours and attitudes need score',
      'Lifestyle and associates need score',
    ]

    const expectedBody = [
      'Sam wants to make changes but needs help.',
      '1 out of 10. (Scores above 2 are high-scoring.)',
      '1 out of 10',
      '6 out of 6. (Scores above 1 are high-scoring.)',
      '6 out of 6',
    ]

    cy.get('#thinking-behaviours-and-attitudes button').click() // click show Thinking, behaviour and attitudes

    cy.get('#thinking-behaviours-and-attitudes .govuk-accordion__section-content').as('sectionContent')

    // Header assertions
    cy.get('@sectionContent')
      .find('h4')
      .then(headings => {
        headings.toArray().forEach((heading, index) => {
          expect(heading.textContent).to.equal(expectedHeadings[index])
        })
      })

    // Body assertions
    cy.get('@sectionContent')
      .find('.govuk-body')
      .then(bodyElements => {
        const actualBody = bodyElements.toArray().map(body => body.textContent.replace(/\s+/g, ' '))
        actualBody.forEach((body, index) => {
          expect(body).to.contain(expectedBody[index])
        })
      })
  })

  it('Should check if the score graph for Thinking behaviour and attitudes is displayed correctly', () => {
    cy.get('#thinking-behaviours-and-attitudes .assessment-score').eq(0).find('.lowscoring').should('have.length', 1)
  })

  it('Should check if the score graph for Lifestyle and associates is displayed correctly', () => {
    cy.get('#thinking-behaviours-and-attitudes .assessment-score').eq(1).find('.highscoring').should('have.length', 6)
  })

  it('Should check if the data for (area without a need score) drug use are displayed correctly and in order', () => {
    const expectedHeadings = [
      'This area is not linked to RoSH (risk of serious harm)',
      'This area is not linked to risk of reoffending',
      'Motivation to make changes in this area',
      'There are no strengths or protective factors related to this area',
      'Drug use need score',
    ]

    const expectedBody = [
      'Sam is actively making changes.',
      '0 out of 8. (Scores above 0 are high-scoring.)',
      '0 out of 8',
    ]

    cy.get('#drug-use button').click() // click show all in Drug use assessment section

    cy.get('#drug-use .govuk-accordion__section-content').as('sectionContent')

    // Header assertions
    cy.get('@sectionContent')
      .find('h4')
      .then(headings => {
        headings.toArray().forEach((heading, index) => {
          expect(heading.textContent).to.equal(expectedHeadings[index])
        })
      })

    // Body assertions
    cy.get('@sectionContent')
      .find('.govuk-body')
      .then(bodyElements => {
        const actualBody = bodyElements.toArray().map(body => body.textContent.replace(/\s+/g, ' '))
        actualBody.forEach((body, index) => {
          expect(body).to.contain(expectedBody[index])
        })
      })
  })

  it('Should check if the data for (non-scoring area) Health and wellbeing are displayed correctly and in order', () => {
    const expectedHeadings = [
      'This area is not linked to RoSH (risk of serious harm)',
      'This area is not linked to risk of reoffending',
      'Motivation to make changes in this area',
      'There are no strengths or protective factors related to this area',
      'This area never has a need score',
    ]

    const expectedBody = ['There is no risk of serious harm', 'This question was not applicable.']

    cy.get('#health-and-wellbeing button').click() // click show all in non-scoring assessment section

    cy.get('#health-and-wellbeing .govuk-accordion__section-content').as('sectionContent') // Header assertions

    cy.get('@sectionContent')
      .find('h4')
      .then(headings => {
        headings.toArray().forEach((heading, index) => {
          expect(heading.textContent).to.equal(expectedHeadings[index])
        })
      })

    // Body assertions
    cy.get('@sectionContent')
      .find('.govuk-body')
      .then(bodyElements => {
        const actualBody = bodyElements.toArray().map(body => body.textContent)
        actualBody.forEach((body, index) => {
          expect(body).to.contain(expectedBody[index])
        })
      })
  })

  it('Should check if the data for (non-scoring area) finance are displayed correctly and in order', () => {
    const expectedHeadings = [
      'This area is not linked to RoSH (risk of serious harm)',
      'This area is not linked to risk of reoffending',
      'Motivation to make changes in this area',
      'There are no strengths or protective factors related to this area',
      'This area never has a need score',
    ]

    const expectedBody = ['There is no risk of reoffending', 'This question was not applicable.', 'Nothing to add']

    cy.get('#finances button').click() // click show all in non-scoring assessment section

    cy.get('#finances .govuk-accordion__section-content').as('sectionContent') // Header assertions

    cy.get('@sectionContent')
      .find('h4')
      .then(headings => {
        headings.toArray().forEach((heading, index) => {
          expect(heading.textContent).to.equal(expectedHeadings[index])
        })
      })

    // Body assertions
    cy.get('@sectionContent')
      .find('.govuk-body')
      .then(bodyElements => {
        const actualBody = bodyElements.toArray().map(body => body.textContent)
        actualBody.forEach((body, index) => {
          expect(body).to.contain(expectedBody[index])
        })
      })
  })
  it('Should click create goal then use the back link to return to /about', () => {
    cy.get('h1').should('include.text', 'About')
    cy.get('[role="button"]').eq(1).contains('Create goal').click()
    cy.url().should('include', '/create-goal')
    cy.get('.govuk-back-link').should('have.attr', 'href').and('include', '/about')
    cy.get('.govuk-back-link').click()
    cy.url().should('include', '/about')
    cy.checkAccessibility()
  })
})

describe('Rendering About Person in READ_ONLY', () => {
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('plan')
      cy.openSentencePlan(planDetails.oasysAssessmentPk, { accessMode: AccessMode.READ_ONLY })
      cy.get('.moj-primary-navigation__container').contains('a', 'About').click()
    })
  })

  it('Should check the page rendered correctly with no Create Goal button', () => {
    cy.get('h1').should('include.text', 'About')
    cy.get('h2').eq(1).contains('Sentence information')
    cy.get('h2').eq(3).contains('High-scoring areas from the assessment')
    cy.get('[role="button"]').should('have.length', 1)
    cy.get('[role="button"]').eq(0).should('contain', 'Return to OASys')
    cy.checkAccessibility()
  })

  it('Should check there are no links to create goal', () => {
    cy.get('a[href]').each(link => {
      const href = link.attr('href')
      expect(href).not.to.contain('create-goal')
    })
  })
})
