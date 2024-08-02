import { addGoalToPlan, addStepToGoal, createSentencePlan, openSentencePlan } from './commands/backend'
import 'cypress-axe'
import { checkAccessibility } from './commands/accessibility'
import {
  clickButton,
  createCompleteGoal,
  createGoal,
  selectAchievementDate,
  selectAchievementDateSomethingElse,
  selectGoalAutocompleteOption,
  selectOtherAreasOfNeed,
  selectOtherAreasOfNeedRadio,
  selectStartWorkingRadio,
} from './commands/frontend'

// Handover/Auth
Cypress.Commands.add('openSentencePlan', openSentencePlan)
Cypress.Commands.add('createSentencePlan', createSentencePlan)

// API
Cypress.Commands.add('addGoalToPlan', addGoalToPlan)
Cypress.Commands.add('addStepToGoal', addStepToGoal)

// Accessibility
Cypress.Commands.add('checkAccessibility', checkAccessibility)

// Frontend
Cypress.Commands.add('selectGoalAutocompleteOption', selectGoalAutocompleteOption)
Cypress.Commands.add('createGoal', createGoal)
Cypress.Commands.add('selectOtherAreasOfNeedRadio', selectOtherAreasOfNeedRadio)
Cypress.Commands.add('selectStartWorkingRadio', selectStartWorkingRadio)
Cypress.Commands.add('selectOtherAreasOfNeed', selectOtherAreasOfNeed)
Cypress.Commands.add('selectAchievementDate', selectAchievementDate)
Cypress.Commands.add('selectAchievementDateSomethingElse', selectAchievementDateSomethingElse)
Cypress.Commands.add('clickButton', clickButton)
Cypress.Commands.add('createCompleteGoal', createCompleteGoal)
