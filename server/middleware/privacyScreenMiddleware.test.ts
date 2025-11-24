import mockReq from '../testutils/preMadeMocks/mockReq'
import mockRes from '../testutils/preMadeMocks/mockRes'
import checkPrivacyScreenAgreed from './privacyScreenMiddleware'
import URLs from '../routes/URLs'

describe('checkPrivacyScreenAgreed', () => {
  it('should redirect to privacy screen if not already agreed', () => {
    const req = mockReq()
    const res = mockRes()
    const next = jest.fn()

    const middleware = checkPrivacyScreenAgreed()

    middleware(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith(URLs.DATA_PRIVACY)
  })
})

it('should call next if agreed', () => {
  const req = mockReq()
  const res = mockRes()
  const next = jest.fn()

  req.session.hasAgreedPrivacyPolicy = true

  const middleware = checkPrivacyScreenAgreed()

  middleware(req, res, next)

  expect(next).toHaveBeenCalled()
})
