import PlanOverview from '../../pages/plan-overview'
import { handleDataPrivacyScreen } from '../../support/commands/privacyScreen'

const setupPlan = () => {
  const randomCRN = `X${Math.floor(100000 + Math.random() * 900000)}`
  return cy.createSentencePlan().then(planDetails => {
    cy.wrap(planDetails).as('plan')
    cy.openSentencePlanAuth(planDetails.oasysAssessmentPk, {
      planUuid: planDetails.plan.uuid,
      crn: randomCRN,
      username: 'AUTH_ADM',
    })

    handleDataPrivacyScreen()
  })
}

describe('Users with the role can access a plan with goals', { testIsolation: false }, () => {
  before(() => {
    setupPlan()
  })

  const planOverview = new PlanOverview()

  it('Agreed plan does not show about page when using HMPPS Auth', () => {
    cy.get('#create-goal-button').click()
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

  it('Agreed plan does not show return to OASys link on plan-history', () => {
    cy.get('.moj-primary-navigation__container').contains('Plan history').click()
    cy.get('h1').contains('Plan history')
    cy.get('.govuk-button--secondary').should('not.exist')
  })
})

describe('Users with the role can access a plan with goals', () => {
  beforeEach(() => {
    setupPlan()
  })

  it('Shows Auth User in the header', () => {
    cy.get('.hmpps-header__account-details__sub-text').should('have.text', 'Auth User')
    cy.checkAccessibility()
  })
})

describe('Users with the role can access a plan without goals', () => {
  beforeEach(() => {
    setupPlan()
  })
  it('Shows correct text and link', () => {
    cy.get('#goal-list').contains('does not have any goals to work on now. You can either:')
    cy.get('#goal-list').should('contain', 'view information from')
  })
})
