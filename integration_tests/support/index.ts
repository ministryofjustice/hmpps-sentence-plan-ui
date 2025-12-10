import compareSnapshotCommand from 'cypress-image-diff-js/command'
import {
  addGoalToPlan,
  addStepToGoal,
  agreePlan,
  createSentencePlan,
  lockPlan,
  openSentencePlan,
  openSentencePlanAuth,
  removeGoalFromPlan,
} from './commands/backend'
import { checkAccessibility } from './commands/accessibility'
import 'cypress-axe'
import { hasFeedbackLink } from './commands/feedback'
import { handleDataPrivacyScreen } from './commands/privacyScreen'

compareSnapshotCommand()

// Handover/Auth
Cypress.Commands.add('openSentencePlan', openSentencePlan)
Cypress.Commands.add('openSentencePlanAuth', openSentencePlanAuth)
Cypress.Commands.add('createSentencePlan', createSentencePlan)
Cypress.Commands.add('handleDataPrivacyScreen', handleDataPrivacyScreen)

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

// Obfuscate dynamic data on the page (such as dates) before taking a screenshot for visual regression testing
Cypress.Screenshot.defaults({
  onBeforeScreenshot($el) {
    const replacements = [
      {
        find: /([1-9]|[12]\d|3[01]) (January|February|March|April|May|June|July|August|September|October|November|December) \d{4}/g,
        replace: 'DD MM YYYY',
      },
    ]

    const walk = (node: Node) => {
      // Only process text nodes
      if (node.nodeType === Node.TEXT_NODE) {
        replacements.forEach(replacement => {
          if (replacement.find.test(node.nodeValue)) {
            // eslint-disable-next-line no-param-reassign
            node.nodeValue = node.nodeValue.replace(replacement.find, replacement.replace)
          }
        })
      } else {
        node.childNodes.forEach(walk)
      }
    }
    $el.get().forEach(el => walk(el))
  },
})
