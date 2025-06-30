import compareSnapshotCommand from 'cypress-image-diff-js/command'
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
import { hasFeedbackLink } from './commands/feedback'

compareSnapshotCommand()

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

// Feedback
Cypress.Commands.add('hasFeedbackLink', hasFeedbackLink)
