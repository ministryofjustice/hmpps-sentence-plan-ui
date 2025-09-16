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
    beforeEach(() => {
      cy.createSentencePlanWithVersions(5, 0).then(planDetails => {
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

    // it('Should display the all versions table with correct headers', () => {
    //   cy.get('.previous-versions-table').should('be.visible').and('have.length', 1)
    //   cy.get('thead th').should('have.length', 4)
    //   cy.get('thead th').eq(0).should('contain.text', 'Date and what was updated')
    //   cy.get('thead th').eq(1).should('contain.text', 'Assessment')
    //   cy.get('thead th').eq(2).should('contain.text', 'Sentence plan')
    //   cy.get('thead th').eq(3).should('contain.text', 'Status')
    //
    //   cy.get('tbody tr').should('have.length', 4)
    //   cy.get('tbody tr').each((_el, index) => {
    //     const columns = `tbody tr:nth-child(${index + 1}) td`
    //     cy.get(columns).should('have.length', 4)
    //
    //     const today = new Date()
    //     const expectedDate = new Date(today.setDate(today.getDate() - index - 1)).toLocaleDateString('en-GB', {
    //       day: 'numeric',
    //       month: 'long',
    //       year: 'numeric',
    //     })
    //     cy.get(columns).eq(0).should('contain.text', expectedDate)
    //     cy.get(columns).eq(2).find('a').should('contain.text', 'View').as('view-link')
    //
    //     cy.get('@view-link').should('have.attr', 'target').and('equal', '_blank')
    //     cy.get('@view-link').invoke('attr', 'target', '_self').click()
    //     cy.url().should('not.include', URLs.PREVIOUS_VERSIONS)
    //     cy.go('back')
    //     cy.url().should('include', URLs.PREVIOUS_VERSIONS)
    //   })
    // })

    it('Should not display "All versions" or "Countersigned versions" table caption if countersigned versions do not exist', () => {
      cy.get('.previous-versions-table').should('exist')
      cy.get('.govuk-table__caption--m').should('not.exist', 'All versions')
      cy.get('.govuk-table__caption--m').should('not.exist', 'Countersigned versions')

    })
  })

  describe('Plan with countersigned versions', () => {
    beforeEach(() => {
      cy.createSentencePlanWithVersions(4, 4).then(planDetails => {
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

    // it('Should display the countersigned versions table above the all versions table with correct headers', () => {
    //   cy.get('.previous-versions-table').should('be.visible')
    //   cy.get('.previous-versions-table .govuk-table__caption--m').eq(0).should('contain.text', 'Countersigned versions')
    //   cy.get('thead th').should('have.length', 8)
    //
    //
    //   cy.get('tbody tr').should('have.length', 9)
    //   cy.get('tbody tr').each((_el, index) => {
    //     const columns = `tbody tr:nth-child(${index + 1}) td`
    //     cy.get(columns).should('have.length', 7)
    //
    //     const today = new Date()
    //     const expectedDate = new Date(today.setDate(today.getDate() - index)).toLocaleDateString('en-GB', {
    //       day: 'numeric',
    //       month: 'long',
    //       year: 'numeric',
    //     })
    //
    //     cy.get(columns)
    //       .eq(0)
    //       .should('contain', expectedDate)
    //
    //     cy.get(columns).eq(2).find('a').should('contain.text', 'View').as('view-link')
    //
    //     cy.get('@view-link').should('have.attr', 'target').and('equal', '_blank')
    //     cy.get('@view-link').invoke('attr', 'target', '_self').click()
    //     cy.url().should('not.include', URLs.PREVIOUS_VERSIONS)
    //     cy.go('back')
    //     cy.url().should('include', URLs.PREVIOUS_VERSIONS)
    //   })
    // })
  })
})


