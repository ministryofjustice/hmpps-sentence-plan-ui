import { createMachine, state, transition } from 'robot3'
import { Request, Response } from 'express'
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

export function redirectToNextState(req: Request, res: Response) {
  const { action } = req.body
  const currentState: keyof typeof stateJourneyMachine.states = req.session.userJourney.state

  // Determine the next state
  const nextState = getNextState(currentState, action)

  // Store previous state before updating
  req.session.userJourney.prevState = currentState
  req.session.userJourney.state = nextState

  let redirectUrl = stateUrlMap[nextState] || URLs.PLAN_OVERVIEW

  if (redirectUrl.includes(':uuid')) {
    redirectUrl = redirectUrl.replace(':uuid', req.params.uuid) // TODO need to standardise this by extracting this method into something which just takes a state, an action and a uuid if it exists
  } else if (redirectUrl.includes(':areaOfNeed')) {
    redirectUrl = redirectUrl.replace(':areaOfNeed', req.body.areaOfNeed)
  }

  return res.redirect(redirectUrl)
}

// Function to compute the next state using Robot 3
function getNextState(
  currentState: keyof typeof stateJourneyMachine.states,
  action: string,
): keyof typeof stateJourneyMachine.states {
  // @ts-expect-error this is very cool
  if (stateJourneyMachine.states[currentState]?.transitions.get(action)) {
    return stateJourneyMachine.states[currentState]?.transitions.get(action)[0].to
  }

  return currentState
}

export function getBackUrlFromState(currentState: keyof typeof stateJourneyMachine.states) {
  return getNextState(currentState, 'back')
}

export default stateJourneyMachine
