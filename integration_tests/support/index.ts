import { createSentencePlan, enterSentencePlan } from './commands/backend'

// Backend
Cypress.Commands.add('enterSentencePlan', enterSentencePlan)
Cypress.Commands.add('createSentencePlan', createSentencePlan)
