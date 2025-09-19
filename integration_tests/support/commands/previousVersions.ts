import URLs from '../../../server/routes/URLs'

export const hasPreviousVersionsPageLink = (isTrue: boolean) => {
  const stubPreviousVersionsPageUrl = Cypress.env('PREVIOUS_VERSIONS_PAGE_URL')

  if (isTrue) {
    cy.get('.plan-header [data-previous-versions-link]').as('previousVersionsPageLink')
    cy.get('@previousVersionsPageLink').should('contain', `View previous versions`)

    cy.get('@previousVersionsPageLink').invoke('attr', 'target', '_self').click()
    cy.url().should('equal', stubPreviousVersionsPageUrl)

    cy.go('back')
  } else {
    cy.get('.plan-header [data-previous-versions-link]').should('not.exist')
  }
}

const checkTable = (
  numberOfVersions: number,
  options: {
    tableIndex?: number
    dateOffset?: number
    linkAliasPrefix?: string
    expectedCaption?: string
  } = {},
) => {
  const { tableIndex = 0, dateOffset = 0, linkAliasPrefix = 'view-link', expectedCaption } = options

  const tableSelector =
    tableIndex !== undefined ? `.previous-versions-table:eq(${tableIndex})` : '.previous-versions-table'

  // consts to remove magic numbers:
  const columnQuantity = 4
  const dateColumnIndex = 0
  const assessmentColumnIndex = 1
  const planColumnIndex = 2
  const statusColumnIndex = 3

  cy.get(tableSelector).within(() => {
    if (expectedCaption) {
      cy.get('.govuk-table__caption--m').should('contain.text', expectedCaption)
    } else {
      cy.get('.govuk-table__caption--m').should('not.exist')
    }

    // table headers:
    cy.get('thead th').should('have.length', columnQuantity)
    cy.get('thead th').eq(dateColumnIndex).should('contain.text', 'Date and what was updated')
    cy.get('thead th').eq(assessmentColumnIndex).should('contain.text', 'Assessment')
    cy.get('thead th').eq(planColumnIndex).should('contain.text', 'Sentence plan')
    cy.get('thead th').eq(statusColumnIndex).should('contain.text', 'Status')

    // number of rows:
    cy.get('tbody tr').should('have.length', numberOfVersions)

    // each row:
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

      // date column:
      cy.get(columns).eq(dateColumnIndex).should('contain', expectedDate)

      // plan link view link:
      const linkAlias = `${linkAliasPrefix}-${tableIndex}-${index}`
      cy.get(columns).eq(planColumnIndex).find('a').should('contain.text', 'View').as(linkAlias)

      // link behavior:
      cy.get(`@${linkAlias}`).should('have.attr', 'target').and('equal', '_blank')
      cy.get(`@${linkAlias}`).invoke('attr', 'target', '_self').click()
      cy.url().should('not.include', URLs.PREVIOUS_VERSIONS)
      cy.go('back')
      cy.url().should('include', URLs.PREVIOUS_VERSIONS)
    })
  })
}

export const checkSinglePreviousVersionsTable = (numberOfVersions: number, expectedCaption: string) => {
  return checkTable(numberOfVersions, {
    tableIndex: 0,
    dateOffset: 2,
    linkAliasPrefix: 'view-link',
    expectedCaption,
  })
}

export const checkBothPreviousVersionsTables = (numberOfVersions: number, numberOfCountersignedVersions: number) => {
  // countersigned versions table (first table):
  checkTable(numberOfCountersignedVersions, {
    tableIndex: 0,
    dateOffset: 2,
    linkAliasPrefix: 'countersigned-view-link',
    expectedCaption: 'Countersigned versions',
  })

  // all versions table (second table):
  checkTable(numberOfVersions, {
    tableIndex: 1,
    dateOffset: numberOfVersions + numberOfCountersignedVersions - 2,
    linkAliasPrefix: 'regular-view-link',
    expectedCaption: 'All versions',
  })
}
