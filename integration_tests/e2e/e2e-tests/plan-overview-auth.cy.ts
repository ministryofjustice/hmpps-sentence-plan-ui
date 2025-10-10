import {PlanType} from "../../../server/@types/PlanType";
import DataGenerator from "../../support/DataGenerator";
import PlanOverview from "../../pages/plan-overview";

describe('Users with the role can access the plan', () => {
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

  it('Shows Auth User in the header', () => {
    cy.get('.hmpps-header__account-details__sub-text').should('have.text', 'Auth User')
    cy.checkAccessibility()
  })

  it('Agreed plan does not show about page when using HMPPS Auth', () => {
    cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
      cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal({ title: 'Test Accommodation' })).then(goal => {
        cy.addStepToGoal(goal.uuid, DataGenerator.generateStep())
        cy.visit('/plan')
      })
    })
    planOverview.agreePlan()
    cy.get('.moj-primary-navigation__container').should('not.contain', 'About')
  })
})
