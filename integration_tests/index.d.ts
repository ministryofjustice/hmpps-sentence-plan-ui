declare namespace Cypress {
  import {NewGoal} from "../server/@types/NewGoalType";
  interface Chainable<T> {
    get<S = JQuery<HTMLElement>>(alias: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>): Chainable<S>

    // Handover/Auth
    openSentencePlan(oasysAssessmentPk: string): Chainable<T>
    createSentencePlan(): Chainable<T>

    // API
    addGoalsToPlan(planUuid: string, goal?: NewGoal): Chainable<T>
  }
}
