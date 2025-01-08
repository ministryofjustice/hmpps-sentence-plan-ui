import {
  addGoalToPlan,
  addStepToGoal,
  agreePlan,
  createSentencePlan,
  lockPlan,
  openSentencePlan,
  removeGoalFromPlan,
} from './commands/backend'
import { checkAccessibility } from './commands/accessibility'
import 'cypress-axe'

// Handover/Auth
Cypress.Commands.add('openSentencePlan', openSentencePlan)
Cypress.Commands.add('createSentencePlan', createSentencePlan)

// API
Cypress.Commands.add('addGoalToPlan', addGoalToPlan)
Cypress.Commands.add('addStepToGoal', addStepToGoal)
Cypress.Commands.add('removeGoalFromPlan', removeGoalFromPlan)
Cypress.Commands.add('agreePlan', agreePlan)

Cypress.Commands.add('lockPlan', lockPlan)

// Accessibility
Cypress.Commands.add('checkAccessibility', checkAccessibility)
