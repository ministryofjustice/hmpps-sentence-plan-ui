import { Request, Response, NextFunction } from 'express'
import { Session } from 'express-session'
import authorisationMiddleware from './authorisationMiddleware'
import mockReq from '../testutils/preMadeMocks/mockReq'
import mockRes from '../testutils/preMadeMocks/mockRes'
import handoverData from '../testutils/data/handoverData'

jest.mock('../services/sessionService', () => {
  return jest.fn().mockImplementation(() => ({
    getPrincipalDetails: jest.fn().mockReturnValue(handoverData.principal),
  }))
})

describe('authorisationMiddleware', () => {
  let req: Partial<Request>
  let res: Partial<Response>
  let next: NextFunction

  beforeEach(() => {
    req = mockReq()
    res = mockRes()
    next = jest.fn()
  })

  it('should call next if principal details are present', async () => {
    ;(req.services.sessionService.getPrincipalDetails as jest.Mock).mockReturnValue({})

    const middleware = authorisationMiddleware()
    middleware(req as Request, res as Response, next)

    expect(req.services!.sessionService.getPrincipalDetails).toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
    expect(res.redirect).not.toHaveBeenCalled()
  })

  it('should redirect to /sign-in if principal details are not present', async () => {
    ;(req.services.sessionService.getPrincipalDetails as jest.Mock).mockReturnValue(null)
    req.originalUrl = '/test-url'
    req.session = {} as Session

    const middleware = authorisationMiddleware()
    middleware(req as Request, res as Response, next)

    expect(req.services!.sessionService.getPrincipalDetails).toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
    expect(res.redirect).toHaveBeenCalledWith('/sign-in')
    expect(req.session!.returnTo).toBe('/test-url')
  })
})
