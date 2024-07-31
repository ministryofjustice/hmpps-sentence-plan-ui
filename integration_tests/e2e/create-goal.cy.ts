import {addGoalsToPlan} from "../support/commands/backend";

describe('Create a new Goal', () => {
  beforeEach(() => {
    cy.createSentencePlan().then((planDetails) => {
        cy.wrap(planDetails).as('planDetails')
        cy.openSentencePlan(planDetails.oasysAssessmentPk)
    })
  })

  it('Creates a new goal with steps', function () {
    cy.url().should('include', '/about-pop')
    cy.get("a[href='/create-goal/accommodation']").click()
    cy.url().should('include', '/create-goal/accommodation')
    cy.get('#goal-name').type('acc{downArrow},{enter}')
    cy.get('#other-area-of-need-radio').click()
    cy.get('.govuk-checkboxes').first().contains('Employment and education').click()
    cy.get('.govuk-checkboxes').first().contains('Drug use').click()
    cy.get('#start-working-goal-radio').click()
    cy.get('.govuk-radios').last().contains('In 6 months').click()
    cy.get('button').contains('Add steps').click()
    cy.url().should('include', '/steps/create')
    cy.get('#step-name').click()
    cy.get('#step-name').type('This is the first step')
    cy.get('#actor').click()
    cy.get('#actor-2').click()
    cy.get('button').contains('Save and continue').click()
    cy.url().should('include', '/plan-summary')
  })

  it('Creates a new goal with errors', () => {
    cy.url().should('include', '/about-pop')
    cy.get("a[href='/create-goal/accommodation']").click()
    cy.url().should('include', '/create-goal/accommodation')
    cy.get('#goal-name').type('acc{downArrow},{enter}')
    cy.get('#start-working-goal-radio').click()
    cy.get('.govuk-radios').last().contains('In 6 months').click()
    cy.get('button').contains('Add steps').click()
    cy.url().should('include', '/create-goal/accommodation')
    cy.contains('#other-area-of-need-radio-error', 'Select yes if this goal is related to any other area of need')
  })

  it('Creates a new goal without steps', () => {
    cy.url().should('include', '/about-pop')
    cy.get("a[href='/create-goal/accommodation']").click()
    cy.url().should('include', '/create-goal/accommodation')
    cy.get('#goal-name').type('acc{downArrow},{enter}')
    cy.get('#other-area-of-need-radio').click()
    cy.get('.govuk-checkboxes').first().contains('Employment and education').click()
    cy.get('.govuk-checkboxes').first().contains('Drug use').click()
    cy.get('#start-working-goal-radio').click()
    cy.get('.govuk-radios').last().contains('In 6 months').click()
    cy.get('button').contains('Save without steps').click()
    cy.url().should('include', '/plan-summary')
  })
})
