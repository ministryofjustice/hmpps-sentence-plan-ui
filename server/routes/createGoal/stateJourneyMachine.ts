import { createMachine, state, transition } from 'robot3'
import URLs from '../URLs'

// Define the journey states
// transitions are of the form (actionTaken, newState)
const stateJourneyMachine = createMachine({
  plan: state(
    transition('createGoal', 'createGoal'),
    transition('changeGoal', 'changeGoal'),
    transition('deleteGoal', 'deleteGoal'),
    transition('addSteps', 'addStepsFromPlan'),
    transition('agreePlan', 'agreePlan'),
  ),
  createGoal: state(
    transition('back', 'plan'),
    transition('saveWithoutSteps', 'plan'),
    transition('addSteps', 'addStepsFromCreateGoal'),
  ),
  addStepsFromCreateGoal: state(transition('back', 'changeGoal'), transition('save', 'plan')),
  addStepsFromPlan: state(transition('back', 'plan'), transition('save', 'plan')),
})

// map states to URLs
export const stateUrlMap: Record<string, string> = {
  plan: URLs.PLAN_OVERVIEW,
  createGoal: URLs.CREATE_GOAL,
  changeGoal: URLs.CHANGE_GOAL,
  deleteGoal: URLs.DELETE_GOAL,
  addStepsFromPlan: URLs.ADD_STEPS,
  addStepsFromCreateGoal: URLs.ADD_STEPS,
  agreePlan: URLs.AGREE_PLAN,
}

// Function to compute the next state using Robot 3
export const getNextState = (
  currentState: keyof typeof stateJourneyMachine.states,
  action: string,
): keyof typeof stateJourneyMachine.states => {
  // @ts-expect-error this is very cool
  return stateJourneyMachine.states[currentState]?.transitions[action]?.to || currentState
}

export default stateJourneyMachine
