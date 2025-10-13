import URLs from '../../../server/routes/URLs'

describe('Previous versions', () => {
  it('Previous versions - base', () => {
    cy.createSentencePlan().then(planDetails => {
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
      cy.visit(URLs.PREVIOUS_VERSIONS)
    })

    cy.compareSnapshot('base-page')
  })

  it('Previous versions - multiple previous versions', () => {
    const numberOfVersions = 2
    const numberOfCountersignedVersions = 0
    cy.createSentencePlanWithVersions(numberOfVersions, numberOfCountersignedVersions).then(planDetails => {
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
      cy.visit(URLs.PREVIOUS_VERSIONS)
    })

    cy.compareSnapshot('multiple-previous-versions')
  })

  it('Previous versions - multiple previous and countersigned versions', () => {
    const numberOfVersions = 2
    const numberOfCountersignedVersions = 2
    cy.createSentencePlanWithVersions(numberOfVersions, numberOfCountersignedVersions).then(planDetails => {
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
      cy.visit(URLs.PREVIOUS_VERSIONS)
    })
    cy.compareSnapshot('multiple-previous-and-countersigned-versions')
  })

  it('Previous versions - previous plan version', () => {
    const numberOfVersions = 2
    const numberOfCountersignedVersions = 0
    const planColumnIndex = 2
    cy.createSentencePlanWithVersions(numberOfVersions, numberOfCountersignedVersions).then(planDetails => {
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
      cy.visit(URLs.PREVIOUS_VERSIONS)
    })

    cy.get('.previous-versions-table')
      .first()
      .find('td')
      .eq(planColumnIndex)
      .find('a')
      .should('contain', 'View')
      .click()

    cy.compareSnapshot('previous-plan-version-view')
  })
})
