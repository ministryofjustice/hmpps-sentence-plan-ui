import { Request, Response, NextFunction } from 'express'
import { Session } from 'express-session'
import authorisationMiddleware from './authorisationMiddleware'
import mockReq from '../testutils/preMadeMocks/mockReq'
import mockRes from '../testutils/preMadeMocks/mockRes'
import handoverData from '../testutils/data/handoverData'
import { AccessMode, AuthType } from '../@types/Handover'
import createUserToken from '../testutils/createUserToken'
import { HttpError } from '../utils/HttpError'

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

  it('should call next if READ_WRITE principal details are present', async () => {
    ;(req.services.sessionService.getPrincipalDetails as jest.Mock).mockReturnValue({})

    const middleware = authorisationMiddleware()
    middleware(req as Request, res as Response, next)

    expect(req.services!.sessionService.getPrincipalDetails).toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
    expect(res.redirect).not.toHaveBeenCalled()
  })

  it('should redirect to /sign-in if READ_ONLY principal details are present', async () => {
    ;(req.services.sessionService.getPrincipalDetails as jest.Mock).mockReturnValue({
      ...handoverData.principal,
      accessMode: AccessMode.READ_ONLY,
    })

    const middleware = authorisationMiddleware()
    middleware(req as Request, res as Response, next)

    expect(req.services!.sessionService.getPrincipalDetails).toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  it('should redirect to /sign-in/hmpps-auth if principal details are not present', async () => {
    ;(req.services.sessionService.getPrincipalDetails as jest.Mock).mockReturnValue(null)
    req.originalUrl = '/test-url'
    req.session = {} as Session

    const middleware = authorisationMiddleware()
    middleware(req as Request, res as Response, next)

    expect(req.services!.sessionService.getPrincipalDetails).toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
    expect(res.redirect).toHaveBeenCalledWith('/sign-in/hmpps-auth')
    expect(req.session!.returnTo).toBe('/test-url')
  })

  it('should throw an error if the role is not present', async () => {
    ;(req.services.sessionService.getPrincipalDetails as jest.Mock).mockReturnValue({
      ...handoverData.principal,
      authType: AuthType.HMPPS_AUTH,
    })
    req.originalUrl = '/test-url'
    req.session = {} as Session
    req.user = { authSource: 'auth', username: 'user1', token: createUserToken([]) }

    const middleware = authorisationMiddleware()
    try {
      middleware(req as Request, res as Response, next)
    } catch (error) {
      expect(error).toBeInstanceOf(HttpError)
      expect(error.status).toBe(401)
    }
  })

  it('should call next if the role is present', async () => {
    ;(req.services.sessionService.getPrincipalDetails as jest.Mock).mockReturnValue({
      ...handoverData.principal,
      authType: AuthType.HMPPS_AUTH,
    })
    req.originalUrl = '/test-url'
    req.session = {} as Session
    req.user = { authSource: 'auth', username: 'user1', token: createUserToken(['ROLE_SENTENCE_PLAN']) }

    const middleware = authorisationMiddleware()
    middleware(req as Request, res as Response, next)

    expect(next).toHaveBeenCalled()
  })
})
