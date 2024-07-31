declare namespace Cypress {
  import {NewGoal} from "../server/@types/NewGoalType";
  interface Chainable {
    // Handover/Auth
    openSentencePlan(oasysAssessmentPk: string): Chainable
    createSentencePlan(): Chainable

    // API
    addGoalsToPlan(planUuid: string, goal?: NewGoal): Chainable
  }
}
