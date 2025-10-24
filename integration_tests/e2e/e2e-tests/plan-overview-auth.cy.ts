import PlanOverview from '../../pages/plan-overview'

describe('Users with the role can access a plan with goals', () => {
  const planOverview = new PlanOverview()

  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('plan')
      cy.openSentencePlanAuth(planDetails.oasysAssessmentPk, {
        planUuid: planDetails.plan.uuid,
        crn: 'X775086',
        username: 'AUTH_ADM',
      })
    })
  })

  it('Agreed plan does not show about page when using HMPPS Auth', () => {
    cy.get('div.govuk-width-container header a').click()
    cy.get('#goal-input-autocomplete').click()
    cy.get('#goal-input-autocomplete').type('I will')
    cy.get('#goal-input-autocomplete__option--0').click()
    cy.get('#related-area-of-need-radio-2').click()
    cy.get('#start-working-goal-radio').click()
    cy.get('#date-selection-radio').click()
    cy.get('#create-goal-form > div.govuk-button-group > button:nth-of-type(1)').click()
    cy.get(`#step-actor-1`).select(1)
    cy.get('#step-description-1').click()
    cy.get('#step-description-1').type('Add a step')
    cy.get('div:nth-of-type(3) button').click()
    planOverview.agreePlan()
    cy.get('.moj-primary-navigation__container').should('not.contain', 'About')
  })

  it('Shows Auth User in the header', () => {
    cy.get('.hmpps-header__account-details__sub-text').should('have.text', 'Auth User')
    cy.checkAccessibility()
  })
})

describe('Users with the role can access a plan without goals', () => {
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('plan')
      cy.openSentencePlanAuth(planDetails.oasysAssessmentPk, {
        planUuid: planDetails.plan.uuid,
        crn: 'X775085',
        username: 'AUTH_ADM',
      })
    })
  })

  it('Does not show view information link', () => {
    cy.get('#goal-list').should('not.contain', 'view information from')
  })
})
