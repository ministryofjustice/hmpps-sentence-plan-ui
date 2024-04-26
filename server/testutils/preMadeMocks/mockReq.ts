import { Request } from 'express'
import FormStorageService from '../../services/formStorageService'

jest.mock('../../services/formStorageService')

type MockReqOptions = {
  body?: Record<string, any>
  params?: Record<string, any>
  query?: Record<string, any>
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
  services = { formStorageService: new FormStorageService(null) },
}: MockReqOptions = {}): jest.Mocked<Request> =>
  ({
    body,
    params,
    query,
    errors,
    services,
  }) as jest.Mocked<Request>

export default mockReq
