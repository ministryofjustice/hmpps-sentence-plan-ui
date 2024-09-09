import { Request } from 'express'
import FormStorageService from '../../services/formStorageService'
import SessionService from '../../services/sessionService'
import SentencePlanApiClient from '../../data/sentencePlanApiClient'
import PlanService from '../../services/sentence-plan/planService'
import GoalService from '../../services/sentence-plan/goalService'
import StepService from '../../services/sentence-plan/stepsService'

jest.mock('../../services/formStorageService')

type MockReqOptions = {
  body?: Record<string, any>
  params?: Record<string, any>
  query?: Record<string, any>
  session?: Record<string, any>
  errors?: {
    body?: Record<string, any>
    params?: Record<string, any>
    query?: Record<string, any>
  }
  services?: Record<string, any>
}

const mockReq = ({
  body = {},
  params = {},
  query = {},
  errors = {},
  session = {},
  services = {
    formStorageService: new FormStorageService(null),
    sessionService: new SessionService(null, null, null),
    sentencePlanApiClient: new SentencePlanApiClient(null),
    planService: new PlanService(null),
    goalService: new GoalService(null),
    stepService: new StepService(null),
  },
}: MockReqOptions = {}): jest.Mocked<Request> =>
  ({
    body,
    params,
    query,
    errors,
    session,
    services,
  }) as jest.Mocked<Request>

export default mockReq
