import DataGenerator from '../support/DataGenerator'
import { PlanType } from '../../server/@types/PlanType'

describe('Visual comparison testing', () => {
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
      cy.visit('/plan')
    })
  })

  describe('Plan overview', () => {
    it('Plan overview - base screenshot', () => {
      cy.compareSnapshot('plan-overview-page')
    })

    it('Plan overview - goal without steps screenshot', () => {
      cy.contains('a', 'Create goal').click()
      cy.get(`#goal-input-autocomplete`).type('Get suitable accommodation')
      cy.get(`#related-area-of-need-radio-2`).click()
      cy.get('#start-working-goal-radio').click()
      cy.get('#date-selection-radio').click()
      cy.get('button').contains('Save without steps').click()
      cy.visit('/plan')
      cy.compareSnapshot('plan-overview-goal-without-steps-page')
    })
  })

  describe('About', () => {
    it('About - base screenshot', () => {
      cy.get('.moj-primary-navigation__container').contains('a', 'About').click()
      cy.compareSnapshot('about-page')
    })
  })

  describe('Create goal', () => {
    beforeEach(() => {
      cy.contains('a', 'Create goal').click()
    })

    it('Create goal - accommodation screenshot', () => {
      cy.get('.moj-side-navigation__list').contains('a', 'Accommodation').click()
      cy.compareSnapshot('create-goal-accommodation-page')
    })

    it('Create goal - employment and education screenshot', () => {
      cy.get('.moj-side-navigation__list').contains('a', 'Employment and education').click()
      cy.compareSnapshot('create-goal-employment-and-education-page')
    })

    it('Create goal - finances screenshot', () => {
      cy.get('.moj-side-navigation__list').contains('a', 'Finances').click()
      cy.compareSnapshot('create-goal-finances-page')
    })

    it('Create goal - drug use screenshot', () => {
      cy.get('.moj-side-navigation__list').contains('a', 'Drug use').click()
      cy.compareSnapshot('create-goal-drug-use-page')
    })

    it('Create goal - alcohol use screenshot', () => {
      cy.get('.moj-side-navigation__list').contains('a', 'Alcohol use').click()
      cy.compareSnapshot('create-goal-alcohol-use-page')
    })

    it('Create goal - health and wellbeing screenshot', () => {
      cy.get('.moj-side-navigation__list').contains('a', 'Health and wellbeing').click()
      cy.compareSnapshot('create-goal-health-and-wellbeing-page')
    })

    it('Create goal - personal relationships and community screenshot', () => {
      cy.get('.moj-side-navigation__list').contains('a', 'Personal relationships and community').click()
      cy.compareSnapshot('create-goal-personal-relationships-and-community-page')
    })

    it('Create goal - thinking behaviours and attitude screenshot', () => {
      cy.get('.moj-side-navigation__list').contains('a', 'Thinking, behaviours and attitude').click()
      cy.compareSnapshot('create-goal-thinking-behaviours-and-attitude-page')
    })
  })

  // describe('Plan History', () => {
  //   it('take plan history page screenshot', () => {
  //     cy.visit('/plan-history')
  //     cy.compareSnapshot('plan-history-page')
  //   })
  // })
})
