import { faker } from '@faker-js/faker'
import AddSteps from '../pages/add-steps'
import { PlanType } from '../../server/@types/PlanType'
import DataGenerator from '../support/DataGenerator'

const selectStepDescriptionByIndex = (index: number) => {
  return cy.get(`table.goal-summary-card__steps .govuk-table__body > :nth-child(${index}) > :nth-child(2)`)
}

const selectStepActorByIndex = (index: number) => {
  return cy.get(`table.goal-summary-card__steps .govuk-table__body > :nth-child(${index}) > :nth-child(1)`)
}

describe('Add Steps', () => {
  const addStep = new AddSteps()

  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('plan')
      cy.wrap(planDetails.oasysAssessmentPk).as('oasysAssessmentPk')
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
    })
  })

  describe('Security', () => {
    it('Should display authorisation error if user does not have READ_WRITE role', () => {
      cy.get<string>('@oasysAssessmentPk').then(oasysAssessmentPk => {
        cy.openSentencePlan(oasysAssessmentPk, 'READ_ONLY')
      })

      cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
        const goalData = DataGenerator.generateGoal()
        cy.addGoalToPlan(plan.uuid, goalData).then(goal => {
          cy.visit(`/goal/${goal.uuid}/add-steps`, { failOnStatusCode: false })
          cy.get('.govuk-body').should('contain', 'You do not have permission to perform this action')
        })
      })

      cy.checkAccessibility(true, ['scrollable-region-focusable'])
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

      const step = DataGenerator.generateStep()
      addStep.addStepAutocompleteText(1, step.description)
      addStep.selectStepActor(1, step.actor)

      addStep.saveAndContinue()

      cy.get('table.goal-summary-card__steps .govuk-table__body').children().should('have.length', 1)
      selectStepDescriptionByIndex(1).should('contain', step.description)
      selectStepActorByIndex(1).should('contain', step.actor)
      cy.checkAccessibility()
    })

    it('Add one step, save, then add 2 more', () => {
      cy.url().should('include', '/add-steps')

      const firstStep = DataGenerator.generateStep()
      addStep.addStepAutocompleteText(1, firstStep.description)
      addStep.selectStepActor(1, firstStep.actor)

      addStep.saveAndContinue()

      cy.contains('a', 'Add or change steps').click()

      cy.url().should('include', '/add-steps')

      addStep.addAnotherStepButton()

      const secondStep = DataGenerator.generateStep()
      addStep.addStepAutocompleteText(2, secondStep.description)
      addStep.selectStepActor(2, secondStep.actor)

      addStep.AddAnotherStepPressingEnter(2)

      const thirdStep = DataGenerator.generateStep()
      addStep.addStepAutocompleteText(3, thirdStep.description)
      addStep.selectStepActor(3, thirdStep.actor)

      addStep.saveAndContinue()

      cy.get('table.goal-summary-card__steps .govuk-table__body').children().should('have.length', 3)
      selectStepDescriptionByIndex(1).should('contain', firstStep.description)
      selectStepActorByIndex(1).should('contain', firstStep.actor)
      selectStepDescriptionByIndex(2).should('contain', secondStep.description)
      selectStepActorByIndex(2).should('contain', secondStep.actor)
      cy.checkAccessibility()
      selectStepDescriptionByIndex(3).should('contain', thirdStep.description)
      selectStepActorByIndex(3).should('contain', thirdStep.actor)
      cy.checkAccessibility()
    })

    it('Add multiple steps, removing one during creation', () => {
      cy.url().should('include', '/add-steps')

      const firstStep = DataGenerator.generateStep()
      addStep.addStepAutocompleteText(1, firstStep.description)
      addStep.selectStepActor(1, firstStep.actor)

      addStep.addAnotherStepButton()

      const secondStep = DataGenerator.generateStep()
      addStep.addStepAutocompleteText(2, secondStep.description)
      addStep.selectStepActor(2, secondStep.actor)

      addStep.addAnotherStepButton()

      const thirdStep = DataGenerator.generateStep()
      addStep.addStepAutocompleteText(3, thirdStep.description)
      addStep.selectStepActor(3, thirdStep.actor)

      cy.get('button[value^="remove-step-"]').should('have.length', 3)

      addStep.removeStep(3)

      addStep.saveAndContinue()

      cy.get('table.goal-summary-card__steps .govuk-table__body').children().should('have.length', 2)

      selectStepDescriptionByIndex(1).should('contain', firstStep.description)
      selectStepActorByIndex(1).should('contain', firstStep.actor)

      selectStepDescriptionByIndex(2).should('contain', secondStep.description)
      selectStepActorByIndex(2).should('contain', secondStep.actor)
      cy.checkAccessibility()
    })

    it('Add multiple steps, removing one afterwards', () => {
      cy.url().should('include', '/add-steps')

      const firstStep = DataGenerator.generateStep()
      addStep.addStepAutocompleteText(1, firstStep.description)
      addStep.selectStepActor(1, firstStep.actor)

      addStep.addAnotherStepButton()

      const secondStep = DataGenerator.generateStep()
      addStep.addStepAutocompleteText(2, secondStep.description)
      addStep.selectStepActor(2, secondStep.actor)

      addStep.saveAndContinue()

      cy.get('table.goal-summary-card__steps .govuk-table__body').children().should('have.length', 2)

      cy.contains('a', 'Add or change steps').click()

      addStep.removeStep(2)
      addStep.saveAndContinue()
      cy.get('table.goal-summary-card__steps .govuk-table__body').children().should('have.length', 1)
      selectStepDescriptionByIndex(1).should('contain', firstStep.description)
      selectStepActorByIndex(1).should('contain', firstStep.actor)
      cy.checkAccessibility()
    })

    it('Add single step, pressing clear then repopulating', () => {
      cy.url().should('include', '/add-steps')

      addStep.getStepActor(1).should('contain', 'Choose someone')

      const firstStep = DataGenerator.generateStep()
      addStep.addStepAutocompleteText(1, firstStep.description)
      addStep.selectStepActor(1, firstStep.actor)

      addStep.clearStep()

      addStep.getStepActor(1).should('contain', 'Choose someone')

      const firstStepSecondPopulation = DataGenerator.generateStep()
      addStep.addStepAutocompleteText(1, firstStepSecondPopulation.description)
      addStep.selectStepActor(1, firstStepSecondPopulation.actor)

      addStep.saveAndContinue()

      cy.get('table.goal-summary-card__steps .govuk-table__body').children().should('have.length', 1)

      selectStepDescriptionByIndex(1).should('contain', firstStepSecondPopulation.description)
      selectStepActorByIndex(1).should('contain', firstStepSecondPopulation.actor)
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
      cy.checkAccessibility()
    })

    it('Save with incomplete step throws error', () => {
      cy.url().should('include', '/add-steps')

      const firstStep = DataGenerator.generateStep()
      addStep.addStepAutocompleteText(1, firstStep.description)
      addStep.selectStepActor(1, firstStep.actor)

      addStep.addAnotherStepButton()

      addStep.saveAndContinue()

      cy.get('#step-description-2-error').should('contain', 'Select or enter what they should do to achieve the goal.')
      cy.checkAccessibility()
    })

    it('Save with a long step description shows error', () => {
      const lorem = faker.lorem.paragraphs(40).replace(/(\r\n|\n|\r)/gm, '')
      cy.url().should('include', '/add-steps')

      const firstStep = DataGenerator.generateStep({})
      addStep.putStepAutocompleteText(1, lorem)
      addStep.selectStepActor(1, firstStep.actor)
      addStep.saveAndContinue()

      cy.get('#step-description-1-error').should(
        'contain',
        'What they should do to achieve the goal must be 4,000 characters or less',
      )

      cy.get(`#step-description-1-autocomplete`).invoke('val').should('contain', lorem)
      cy.checkAccessibility()
    })
  })
})
