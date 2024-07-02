import { Request } from 'express'
import FormStorageService from '../../services/formStorageService'
import SessionService from '../../services/sessionService'

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
