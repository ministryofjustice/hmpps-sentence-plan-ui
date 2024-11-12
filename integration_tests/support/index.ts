import { addGoalToPlan, addStepToGoal, createSentencePlan, lockPlan, openSentencePlan } from './commands/backend'
import { checkAccessibility } from './commands/accessibility'
import 'cypress-axe'

// Handover/Auth
Cypress.Commands.add('openSentencePlan', openSentencePlan)
Cypress.Commands.add('createSentencePlan', createSentencePlan)

// API
Cypress.Commands.add('addGoalToPlan', addGoalToPlan)
Cypress.Commands.add('addStepToGoal', addStepToGoal)

Cypress.Commands.add('lockPlan', lockPlan)

// Accessibility
Cypress.Commands.add('checkAccessibility', checkAccessibility)
