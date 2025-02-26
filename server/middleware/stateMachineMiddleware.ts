import { NextFunction, Request, Response } from 'express'
import stateJourneyMachine, { stateUrlMap } from '../routes/createGoal/stateJourneyMachine'

const excludedUrls = [
  '/reference-data/',
  // Add other URLs that should be excluded here
]

const stateMachineMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userJourney) {
    req.session.userJourney = { state: 'plan', prevState: null } // Start at the "plan" step
  }

  // If this is not one of the excluded URLs then validate current state against the defined machine states
  // TODO I don't like this :(
  // @ts-ignore
  if (!excludedUrls.some(url => req.path.startsWith(url))) {
    if (
      !stateJourneyMachine.states[req.session.userJourney.state] ||
      !new RegExp(`^${stateUrlMap[req.session.userJourney.state].replace(/:[^\s/]+/g, '[^/]+')}$`).test(req.path)
    ) {
      req.session.userJourney.state = 'plan' // Reset if invalid
    }
  }

  req.journeyState = req.session.userJourney.state
  res.locals.journeyState = req.session.userJourney.state
  res.locals.prevState = req.session.userJourney.prevState

  next()
}

export default stateMachineMiddleware
