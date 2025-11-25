import mockReq from '../testutils/preMadeMocks/mockReq'
import mockRes from '../testutils/preMadeMocks/mockRes'
import checkPrivacyScreenAgreed from './privacyScreenMiddleware'
import URLs from '../routes/URLs'
import { AccessMode } from '../@types/SessionType'

describe('checkPrivacyScreenAgreed', () => {
  it('should redirect to privacy screen if not already agreed', () => {
    const req = mockReq()
    const res = mockRes()
    const next = jest.fn()

    req.services.sessionService.getAccessMode = jest.fn().mockReturnValue(AccessMode.READ_WRITE)

    const middleware = checkPrivacyScreenAgreed()

    middleware(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith(URLs.DATA_PRIVACY)
  })
})

it('should call next if agreed and READ_WRITE', () => {
  const req = mockReq()
  const res = mockRes()
  const next = jest.fn()

  req.session.hasAgreedPrivacyPolicy = true
  req.services.sessionService.getAccessMode = jest.fn().mockReturnValue(AccessMode.READ_WRITE)

  const middleware = checkPrivacyScreenAgreed()

  middleware(req, res, next)

  expect(next).toHaveBeenCalled()
})

it('should call next if READ_ONLY', () => {
  const req = mockReq()
  const res = mockRes()
  const next = jest.fn()

  req.session.hasAgreedPrivacyPolicy = undefined
  req.services.sessionService.getAccessMode = jest.fn().mockReturnValue(AccessMode.READ_ONLY)

  const middleware = checkPrivacyScreenAgreed()

  middleware(req, res, next)

  expect(next).toHaveBeenCalled()
})
