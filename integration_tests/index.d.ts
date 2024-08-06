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

    // Frontend
    selectGoalAutocompleteOption(text: string, option: number): Chainable
    createGoal(goalType: string): Chainable
    selectOtherAreasOfNeedRadio(value: string): Chainable
    selectStartWorkingRadio(value: string): Chainable
    selectOtherAreasOfNeed(values: string[]): Chainable
    selectAchievementDate(value: string): Chainable
    selectAchievementDateSomethingElse(value: string): Chainable
    clickButton(value: string): Chainable
    createCompleteGoal(value: number): Chainable
    selectFutureGoalsSubNavigation(): Chainable
  }
}
