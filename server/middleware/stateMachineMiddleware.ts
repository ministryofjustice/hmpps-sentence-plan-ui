import { NextFunction, Request, Response } from 'express'
import stateJourneyMachine from '../routes/createGoal/stateJourneyMachine'

const journeyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userJourney) {
    req.session.userJourney = { state: 'plan', prevState: null } // Start at the "plan" step
  }

  // Validate current state against the defined machine states
  // @ts-ignore
  if (!stateJourneyMachine.states[req.session.userJourney.state]) {
    req.session.userJourney.state = 'plan' // Reset if invalid
  }

  req.journeyState = req.session.userJourney.state
  res.locals.journeyState = req.session.userJourney.state
  res.locals.prevState = req.session.userJourney.prevState

  next()
}

export default journeyMiddleware
