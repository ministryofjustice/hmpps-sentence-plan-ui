import { faker } from '@faker-js/faker'
import DataGenerator from '../support/DataGenerator'
import { PlanType } from '../../server/@types/PlanType'
import PlanOverview from '../pages/plan-overview'
import UpdateGoal from '../pages/update-goal'
import { Goal } from '../../server/@types/GoalType'
import { NewGoal } from '../../server/@types/NewGoalType'

describe('Update goal', () => {
  beforeEach(() => {
    cy.createSentencePlan().then(planDetails => {
      cy.wrap(planDetails).as('plan')
      cy.wrap(planDetails.oasysAssessmentPk).as('oasysAssessmentPk')
      cy.openSentencePlan(planDetails.oasysAssessmentPk)
    })
  })

  describe('Set-up agreed plan', () => {
    beforeEach(() => {
      const planOverview = new PlanOverview()
      cy.get<{ plan: PlanType }>('@plan').then(({ plan }) => {
        cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal()).then(goal => {
          cy.wrap(goal).as('goalForNow')
          cy.addStepToGoal(goal.uuid, DataGenerator.generateStep())
        })

        const futureGoal: Partial<NewGoal> = { targetDate: null }
        cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal(futureGoal)).then(goal => {
          cy.wrap(goal).as('goalForFuture')
          cy.addStepToGoal(goal.uuid, DataGenerator.generateStep())
        })

        planOverview.agreePlan()

        cy.addGoalToPlan(plan.uuid, DataGenerator.generateGoal()).then(goal => {
          cy.wrap(goal).as('goalWithNoSteps')
        })
      })
    })

    it('Should say when to achieve this goal by', () => {
      cy.get<Goal>('@goalForNow').then(goal => {
        cy.visit(`/update-goal-steps/${goal.uuid}`)
        cy.get('.govuk-grid-column-full > p').should('include.text', 'Aim to achieve this by')
      })
    })

    it('Should say this is a future goal', () => {
      cy.get<Goal>('@goalForFuture').then(goal => {
        cy.visit(`/update-goal-steps/${goal.uuid}`)
        cy.get('.govuk-grid-column-full > p').should('include.text', 'This is a future goal.')
      })
    })

    it('Back link on a current goal returns to correct tab on plan overview', () => {
      cy.get<Goal>('@goalForNow').then(goal => {
        cy.visit(`/update-goal-steps/${goal.uuid}`)
        cy.contains('a', 'Back').should('have.attr', 'href', '/plan?type=current')
      })
    })

    it('Back link on a future goal returns to correct tab on plan overview', () => {
      cy.get<Goal>('@goalForFuture').then(goal => {
        cy.visit(`/update-goal-steps/${goal.uuid}`)
        cy.contains('a', 'Back').should('have.attr', 'href', '/plan?type=future')
      })
    })

    it('Should say no steps added', () => {
      cy.get<Goal>('@goalWithNoSteps').then(goal => {
        cy.visit(`/update-goal-steps/${goal.uuid}`)
        cy.get('.goal-summary-card__steps--empty-no-shadow').should('include.text', 'No steps added.')
      })
    })

    it('Should display authorisation error if user does not have READ_WRITE role', () => {
      cy.get<string>('@oasysAssessmentPk').then(oasysAssessmentPk => {
        cy.openSentencePlan(oasysAssessmentPk, 'READ_ONLY')
      })

      cy.get<Goal>('@goalForNow').then(goal => {
        cy.visit(`/update-goal-steps/${goal.uuid}`, { failOnStatusCode: false })
        cy.get('.govuk-body').should('contain', 'You do not have permission to perform this action')
      })
      cy.checkAccessibility(true, ['scrollable-region-focusable'])
    })

    it('Can select and update a step status', () => {
      // Go to correct page
      cy.url().should('satisfy', url => url.endsWith('/plan')) // check we're back to plan-overview
      cy.contains('a', 'Update').click() // click update link
      cy.url().should('include', '/update-goal-steps') // check url is update goal

      // Change step status
      cy.get('.govuk-table__body > .govuk-table__row > :nth-child(3)').contains(
        /Not started|In progress|Cannot be done yet|No longer needed|Completed/,
      ) // check contains not started status
      cy.get('#step-status-1').select('Not started') // select not started status
      cy.get('.govuk-button').contains('Save goal and steps').click()

      // Check change is visible on Plan Overview
      cy.url().should('include', '/plan') // check we're back to plan-overview
      cy.get('.govuk-table__body > .govuk-table__row > :nth-child(3)').contains('Not started') // check contains not started status

      // Go to update page and change step status again
      cy.contains('a', 'Update').click() // click update link
      cy.url().should('include', '/update-goal-steps') // check url is update goal
      cy.get('.govuk-table__body > .govuk-table__row > :nth-child(3)').contains('In progress') // check contains not started status
      cy.get('#step-status-1').select('In progress') // select in progress status
      cy.get('.govuk-button').contains('Save goal and steps').click()

      // Check change is visible on Plan Overview
      cy.url().should('include', '/plan') // check we're back to plan-overview
      cy.get('.govuk-table__body > .govuk-table__row > :nth-child(3)').contains('In progress')
      cy.checkAccessibility()
    })

    it('Updating all step status to complete and saving goes to the achieve goal page', () => {
      cy.get<Goal>('@goalForNow').then(goal => {
        cy.visit(`/update-goal-steps/${goal.uuid}`)
        cy.get('#step-status-1').select('Completed')
        cy.get('.govuk-button').contains('Save goal and steps').click()
        cy.url().should('include', `/confirm-if-achieved/${goal.uuid}`)
      })
      cy.checkAccessibility()
    })

    it('Can visit change goal and back link is correct', () => {
      cy.contains('a', 'Update').click()
      cy.contains('a', 'Change goal details').click()
      cy.url().should('include', '/change-goal/')
      cy.url().then(url => {
        const goalUuid = url.substring(url.lastIndexOf('/') + 1)
        cy.contains('a', 'Back').should('have.attr', 'href', `/update-goal-steps/${goalUuid}`)
      })
    })

    it('Clicking Back link does not save', () => {
      cy.contains('a', 'Update').click() // click update link
      cy.url().should('include', '/update-goal-steps') // check url is update goal
      cy.get('.govuk-table__body > .govuk-table__row > :nth-child(3)').contains(
        /Not started|In progress|Cannot be done yet|No longer needed|Completed/,
      ) // check contains not started status
      cy.get('#step-status-1').select('Not started') // select Not started status
      cy.get('.govuk-button').contains('Save goal and steps').click()
      cy.url().should('include', '/plan') // check we're back to plan-overview
      cy.get('.govuk-table__body > .govuk-table__row > :nth-child(3)').contains('Not started') // check contains Not started status
      cy.contains('a', 'Update').click() // click update link
      cy.get('.govuk-table__body > .govuk-table__row > :nth-child(3)').contains('In progress') // check contains In progress status
      cy.get('#step-status-1').select('In progress') // select In progress status
      cy.contains('a', 'Back').click()
      cy.get('.govuk-table__body > .govuk-table__row > :nth-child(3)').contains('Not started') // check contains Not started status
      cy.checkAccessibility()
    })

    it('Can save and view notes attached to a goal', () => {
      const updateGoal = new UpdateGoal()
      updateGoal.createNote()
      cy.visit('/plan') // return to plan-overview
      cy.contains('a', 'Update').click() // click update link
      cy.contains('View all notes').click() // open drop down of notes
      cy.get('.govuk-details__text').contains(updateGoal.notesEntry) // check if created note is there
      cy.checkAccessibility()
    })

    it('Entering a long progress note displays an error', () => {
      const lorem = faker.lorem.paragraphs(40)
      cy.contains('a', 'Update').click() // click update link
      cy.url().should('include', '/update-goal-steps')
      cy.get('#more-detail').invoke('val', lorem)
      cy.get('.govuk-button').contains('Save goal and steps').click()

      cy.get('.govuk-error-summary').should('contain', 'Notes about progress must be 4,000 characters or less')
      cy.get('#more-detail-error').should('contain', 'Notes about progress must be 4,000 characters or less')
      cy.get('#more-detail').should('contain', lorem)
      cy.checkAccessibility()
    })

    function assertComputedContent($el: JQuery<HTMLElement>, expectedContent: string) {
      const before = window.parent.getComputedStyle($el[0], '::before')
      const beforeContent = before.getPropertyValue('content')
      expect(beforeContent).to.equal(expectedContent)
    }

    it('Renders correctly on mobile', () => {
      cy.viewport('iphone-se2')
      cy.get<Goal>('@goalForNow').then(goal => {
        cy.visit(`/update-goal-steps/${goal.uuid}`)
        cy.get('.govuk-table__head').should('not.be.visible')

        cy.get('.govuk-table__cell').each(($el, index) => {
          switch (index) {
            case 0:
              return assertComputedContent($el, '"Who will do this"')
            case 1:
              return assertComputedContent($el, '"Step"')
            case 2:
              return assertComputedContent($el, '"Status"')
            default:
              throw new Error(`Unexpected table cell at index ${index}`)
          }
        })
      })
      cy.checkAccessibility()
    })

    it('Renders correctly on tablet', () => {
      cy.viewport('ipad-2')
      cy.get<Goal>('@goalForNow').then(goal => {
        cy.visit(`/update-goal-steps/${goal.uuid}`)
        cy.get('.govuk-table__head').should('be.visible')
      })
      cy.checkAccessibility()
    })
  })
})
