import {addGoalsToPlan, createSentencePlan, openSentencePlan} from './commands/backend'

// Handover/Auth
Cypress.Commands.add('openSentencePlan', openSentencePlan)
Cypress.Commands.add('createSentencePlan', createSentencePlan)

// API
Cypress.Commands.add('addGoalsToPlan', addGoalsToPlan)
