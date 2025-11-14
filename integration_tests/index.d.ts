declare namespace Cypress {
  import { NewStep, Step } from '../server/@types/StepType'
  import { NewGoal } from '../server/@types/NewGoalType'
  import { Goal } from '../server/@types/GoalType'

  interface Chainable<T> {
    get<S = JQuery<HTMLElement>>(
      alias: string,
      options?: Partial<Loggable & Timeoutable & Withinable & Shadow>,
    ): Chainable<S>

    // Handover/Auth
    openSentencePlan(
      oasysAssessmentPk: string,
      options?: { accessMode?: string; planVersion?: number; crn?: string },
    ): Chainable<T>
    openSentencePlanAuth(
      oasysAssessmentPk: string,
      options?: { accessMode?: string; planUuid?: string; planVersion?: number; crn?: string; username?: string },
    ): Chainable<T>
    createSentencePlan(): Chainable<T>
    handleDataPrivacyScreen(): Chainable<T>

    // SAN handover session check when viewing previous version
    createAssessment(): Chainable<T>
    enterAssessment(): Chainable<T>

    // API
    addGoalToPlan(planUuid: string, goal: NewGoal): Chainable<Goal>
    addStepToGoal(goalUuid: string, step: NewStep): Chainable<Step>
    removeGoalFromPlan(goalUuid: string, note: string): Chainable<Goal>
    agreePlan(planUuid: string): Chainable<Goal>

    lockPlan(planUuid: string): Chainable<T>
    createSentencePlanWithVersions(numberOfVersions: number, numberOfCountersignedVersions: number): Chainable<T>

    // Accessibility
    checkAccessibility(injectAxe: boolean = true, disabledRules: string[] = []): Chainable<T>

    // Feedback
    hasFeedbackLink(): Chainable

    // Navigation links
    hasPreviousVersionsPageLink(hasLink: boolean = true): Chainable

    // Previous versions tables check
    checkSinglePreviousVersionsTable(numberOfVersions: number, expectedCaption: string): Chainable
    checkBothPreviousVersionsTables(numberOfVersions: number, numberOfCountersignedVersions: number): Chainable
  }
}
