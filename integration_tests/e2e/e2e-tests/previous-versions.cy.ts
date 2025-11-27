import URLs from '../../../server/routes/URLs'

describe('View Previous Versions', () => {
  describe('Links and accessibility', () => {
    beforeEach(() => {
      cy.createSentencePlan().then(planDetails => {
        cy.wrap(planDetails).as('plan')
        cy.openSentencePlan(planDetails.oasysAssessmentPk)
        cy.visit(URLs.PREVIOUS_VERSIONS)
      })
    })

    afterEach(() => {
      cy.checkAccessibility()
    })

    it('Has a feedback link', () => {
      cy.hasFeedbackLink()
    })

    it('Has no previous versions page link', () => {
      cy.hasPreviousVersionsPageLink(false)
    })

    it('Should have a `Return to OASys` button and return the user to the OASys return URL', () => {
      cy.contains('a', 'Return to OASys').should('have.attr', 'href').and('include', Cypress.env('OASTUB_URL'))
    })
  })

  describe('Plan with no versions', () => {
    beforeEach(() => {
      cy.createSentencePlan().then(planDetails => {
        cy.wrap(planDetails).as('plan')
        cy.openSentencePlan(planDetails.oasysAssessmentPk)
        cy.visit(URLs.PREVIOUS_VERSIONS)
      })
    })

    afterEach(() => {
      cy.checkAccessibility()
    })

    it('Should display "no versions" message and no versions table when no previous versions exist', () => {
      cy.get('.govuk-body').should('contain.text', "There are no previous versions of Sam's assessment and plan yet.")
      cy.get('.previous-versions-table').should('not.exist')
    })
  })

  describe('Plan with multiple previous versions', () => {
    const numberOfVersions = 5
    const numberOfCountersignedVersions = 0
    const numberOfTables = 1
    beforeEach(() => {
      cy.createSentencePlanWithVersions(numberOfVersions, numberOfCountersignedVersions).then(planDetails => {
        cy.wrap(planDetails).as('plan')
        cy.openSentencePlan(planDetails.oasysAssessmentPk)
        cy.visit(URLs.PREVIOUS_VERSIONS)
      })
    })

    afterEach(() => {
      cy.checkAccessibility()
    })

    it('Should display message for when versions exist', () => {
      cy.get('.govuk-body').should(
        'contain.text',
        "Check versions of Sam's current assessment and plan. The links will open in a new tab.",
      )
      cy.get('.previous-versions-table').should('be.visible')
    })

    it('Should display the all versions table with correct column headers and no tableCaption', () => {
      cy.get('.previous-versions-table').should('be.visible').and('have.length', numberOfTables)
      cy.checkSinglePreviousVersionsTable(numberOfVersions, null)
    })

    it(
      'Should display single plan version with date banner ' +
        'and NO service name link in header/primary navigation bar/view previous versions link' +
        '/return to OASys & create goal/agree plan buttons/goal action buttons',
      () => {
        const planColumnIndex = 2
        const dateOffset = 1
        const columnQuantity = 4

        cy.get('.previous-versions-table').should('be.visible')
        // click on each of the row's 'view' link for sentence plan

        cy.get('tbody tr').each((_el, index) => {
          const columns = `tbody tr:nth-child(${index + 1}) td`
          cy.get(columns).should('have.length', columnQuantity)

          // expected date with offset:
          const today = new Date()
          const expectedDate = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() - index - dateOffset,
          ).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })

          // plan version view link:
          const linkAlias = `row-${index}`
          cy.get(columns).eq(planColumnIndex).find('a').should('contain.text', 'View').as(linkAlias)

          // link behavior:
          cy.get(`@${linkAlias}`).should('have.attr', 'target').and('equal', '_blank')
          cy.get(`@${linkAlias}`).invoke('attr', 'target', '_self').click()
          cy.url().should('not.include', URLs.PREVIOUS_VERSIONS)
          cy.url().should('include', '/view-historic/')

          // date banner check:
          cy.get('.plan-header__previous-version-date-banner').should('contain', `This version is from ${expectedDate}`)

          // no link in service name in header, just text:
          cy.get('.hmpps-header__title__service-name')
            .should('be.visible')
            .and('contain', 'Sentence plan')
            .and('not.have.class', 'hmpps-header__link')

          // no "Subject's plan"/"Plan history"/"About Subject" buttons:
          cy.get('.moj-primary-navigation__container').should('not.exist')

          // no "View previous versions" link
          cy.hasPreviousVersionsPageLink(false)

          // no "Return to OASys"/"Create goal"/"Agree plan" buttons:
          cy.get('.moj-page-header-actions__actions').should('not.be.visible')

          // no change/delete/add steps buttons:
          cy.get('.govuk-summary-card__actions').should('not.exist')

          cy.visit(URLs.PREVIOUS_VERSIONS)
        })
      },
    )
  })

  describe('Plan with countersigned versions', () => {
    const numberOfVersions = 4
    const numberOfCountersignedVersions = 4
    const numberOfTables = 2
    beforeEach(() => {
      cy.createSentencePlanWithVersions(numberOfVersions, numberOfCountersignedVersions).then(planDetails => {
        cy.wrap(planDetails).as('plan')
        cy.openSentencePlan(planDetails.oasysAssessmentPk)
        cy.visit(URLs.PREVIOUS_VERSIONS)
      })
    })

    afterEach(() => {
      cy.checkAccessibility()
    })

    it('Should display message for when versions exist', () => {
      cy.get('.govuk-body').should(
        'contain.text',
        "Check versions of Sam's current assessment and plan. The links will open in a new tab.",
      )
      cy.get('.previous-versions-table').should('be.visible')
    })

    it('Should display the countersigned versions table above the all versions table with correct column headers and table captions', () => {
      cy.get('.previous-versions-table').should('be.visible').and('have.length', numberOfTables)
      cy.checkBothPreviousVersionsTables(numberOfVersions, numberOfCountersignedVersions)
    })
  })
})
