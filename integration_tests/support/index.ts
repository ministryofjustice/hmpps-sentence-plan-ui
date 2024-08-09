import { addGoalToPlan, addStepToGoal, createSentencePlan, openSentencePlan } from './commands/backend'
import { checkAccessibility } from './commands/accessibility'
import 'cypress-axe'

// Handover/Auth
Cypress.Commands.add('openSentencePlan', openSentencePlan)
Cypress.Commands.add('createSentencePlan', createSentencePlan)

// API
Cypress.Commands.add('addGoalToPlan', addGoalToPlan)
Cypress.Commands.add('addStepToGoal', addStepToGoal)

// Accessibility
Cypress.Commands.add('checkAccessibility', checkAccessibility)
