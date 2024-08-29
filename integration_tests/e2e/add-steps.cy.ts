import AddSteps from '../pages/add-steps'
import { PlanType } from '../../server/@types/PlanType'
import DataGenerator from '../support/DataGenerator'

describe('Add Steps', () => {
  const addStep = new AddSteps()

  const selectStepDescriptionByIndex = (index: number) => {
    return cy.get(`table.goal-summary-card__steps .govuk-table__body > :nth-child(${index}) > :nth-child(1)`)
  }

  const selectStepActorByIndex = (index: number) => {
    return cy.get(`table.goal-summary-card__steps .govuk-table__body > :nth-child(${index}) > :nth-child(2)`)
  }

  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('plan')
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
    })
  })

  describe('Adding steps', () => {
    beforeEach(() => {
      cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
        const goalData = DataGenerator.generateGoal()
        cy.addGoalToPlan(plan.uuid, goalData).then(goal => {
          cy.visit(`/goal/${goal.uuid}/add-steps`)
        })
      })
    })

    it('Add one step', () => {
      cy.url().should('include', '/add-steps')
      const stepDescription = 'This is the first step'
      const stepActor = 'Sam'
      addStep.addStepAutocompleteText(1, stepDescription)
      addStep.selectStepActor(1, stepActor)

      cy.contains('button', 'Remove').should('not.exist')

      addStep.saveAndContinue()

      cy.get('table.goal-summary-card__steps .govuk-table__body').children().should('have.length', 1)
      selectStepDescriptionByIndex(1).should('contain', stepDescription)
      selectStepActorByIndex(1).should('contain', stepActor)
    })

    it('Add one step, save, then add another', () => {
      cy.url().should('include', '/add-steps')
      const firstStepDescription = 'This is the first step'
      const firstStepActor = 'Sam'
      addStep.addStepAutocompleteText(1, firstStepDescription)
      addStep.selectStepActor(1, firstStepActor)

      addStep.saveAndContinue()

      cy.contains('a', 'Add or change steps').click()

      cy.url().should('include', '/add-steps')

      addStep.addAnotherStepButton()

      const secondStepDescription = 'This is the second step'
      const secondStepActor = 'Probation practitioner'
      addStep.addStepAutocompleteText(2, secondStepDescription)
      addStep.selectStepActor(2, secondStepActor)

      addStep.saveAndContinue()

      cy.get('table.goal-summary-card__steps .govuk-table__body').children().should('have.length', 2)
      selectStepDescriptionByIndex(1).should('contain', firstStepDescription)
      selectStepActorByIndex(1).should('contain', firstStepActor)
      selectStepDescriptionByIndex(2).should('contain', secondStepDescription)
      selectStepActorByIndex(2).should('contain', secondStepActor)
    })

    it('Add multiple steps, removing one during creation', () => {
      cy.url().should('include', '/add-steps')
      const firstStepDescription = 'This is the first step'
      const firstStepActor = 'Sam'
      addStep.addStepAutocompleteText(1, firstStepDescription)
      addStep.selectStepActor(1, firstStepActor)

      addStep.addAnotherStepButton()

      const secondStepDescription = 'This is the second step'
      const secondStepActor = 'Probation practitioner'
      addStep.addStepAutocompleteText(2, secondStepDescription)
      addStep.selectStepActor(2, secondStepActor)

      addStep.addAnotherStepButton()

      const thirdStepDescription = 'This is the second step'
      const thirdStepActor = 'Probation practitioner'
      addStep.addStepAutocompleteText(3, thirdStepDescription)
      addStep.selectStepActor(3, thirdStepActor)

      cy.get('button[value^="remove-step-"]').should('have.length', 2)

      addStep.removeStep(3)

      addStep.saveAndContinue()

      cy.get('table.goal-summary-card__steps .govuk-table__body').children().should('have.length', 2)

      selectStepDescriptionByIndex(1).should('contain', firstStepDescription)
      selectStepActorByIndex(1).should('contain', firstStepActor)

      selectStepDescriptionByIndex(2).should('contain', secondStepDescription)
      selectStepActorByIndex(2).should('contain', secondStepActor)
    })

    it('Add multiple steps, removing one afterwards', () => {
      cy.url().should('include', '/add-steps')
      const firstStepDescription = 'This is the first step'
      const firstStepActor = 'Sam'
      addStep.addStepAutocompleteText(1, firstStepDescription)
      addStep.selectStepActor(1, firstStepActor)

      addStep.addAnotherStepButton()

      const secondStepDescription = 'This is the second step'
      const secondStepActor = 'Probation practitioner'
      addStep.addStepAutocompleteText(2, secondStepDescription)
      addStep.selectStepActor(2, secondStepActor)

      addStep.saveAndContinue()

      cy.get('table.goal-summary-card__steps .govuk-table__body').children().should('have.length', 2)

      cy.contains('a', 'Add or change steps').click()

      addStep.removeStep(2)
      addStep.saveAndContinue()
      cy.get('table.goal-summary-card__steps .govuk-table__body').children().should('have.length', 1)
      selectStepDescriptionByIndex(1).should('contain', firstStepDescription)
      selectStepActorByIndex(1).should('contain', firstStepActor)
    })
  })

  describe('Error cases when adding steps', () => {
    beforeEach(() => {
      cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
        const goalData = DataGenerator.generateGoal()
        cy.addGoalToPlan(plan.uuid, goalData).then(goal => {
          cy.visit(`/goal/${goal.uuid}/add-steps`)
        })
      })
    })

    it('Save with no data throws error', () => {
      cy.url().should('include', '/add-steps')

      addStep.saveAndContinue()

      cy.get('#step-description-1-error').should('contain', 'Select or enter what they should do to achieve the goal.')
    })

    it('Save with incomplete step throws error', () => {
      cy.url().should('include', '/add-steps')
      const firstStepDescription = 'This is the first step'
      const firstStepActor = 'Sam'
      addStep.addStepAutocompleteText(1, firstStepDescription)
      addStep.selectStepActor(1, firstStepActor)

      addStep.addAnotherStepButton()

      addStep.saveAndContinue()

      cy.get('#step-description-2-error').should('contain', 'Select or enter what they should do to achieve the goal.')
    })
  })
})
