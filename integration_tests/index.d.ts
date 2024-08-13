declare namespace Cypress {
  import { NewStep } from '../server/@types/NewStepType'
  import { Step } from '../server/@types/StepType'
  import { NewGoal } from '../server/@types/NewGoalType'
  import { Goal } from '../server/@types/GoalType'

  interface Chainable<T> {
    get<S = JQuery<HTMLElement>>(
      alias: string,
      options?: Partial<Loggable & Timeoutable & Withinable & Shadow>,
    ): Chainable<S>

    // Handover/Auth
    openSentencePlan(oasysAssessmentPk: string): Chainable<T>
    createSentencePlan(): Chainable<T>

    // API
    addGoalToPlan(planUuid: string, goal: NewGoal): Chainable<Goal>
    addStepToGoal(goalUuid: string, step: NewStep): Chainable<Step>

    // Accessibility
    checkAccessibility(): Chainable
  }
}
