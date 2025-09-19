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
      cy.get('.plan-header [data-previous-versions-link]').should('not.exist')
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
