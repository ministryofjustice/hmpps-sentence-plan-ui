import { createMachine, state, transition } from 'robot3'

// Define the journey states
const createGoalJourneyMachine = createMachine({
  plan: state(transition('createGoal', 'createGoal')),
  createGoal: state(
    transition('back', 'plan'),
    transition('saveWithoutSteps', 'plan'),
    transition('addSteps', 'addSteps'),
  ),
  addSteps: state(transition('back', 'createGoal'), transition('save', 'plan')),
})

// Function to compute the next state using Robot 3
export const getNextState = (
  currentState: keyof typeof createGoalJourneyMachine.states,
  action: string,
): keyof typeof createGoalJourneyMachine.states => {
  // @ts-ignore
  return createGoalJourneyMachine.states[currentState]?.transitions[action]?.to || currentState
}

export default createGoalJourneyMachine
