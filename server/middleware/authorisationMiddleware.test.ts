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
    await middleware(req as Request, res as Response, next)

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
    await middleware(req as Request, res as Response, next)

    expect(req.services!.sessionService.getPrincipalDetails).toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  it('should redirect to /sign-in/hmpps-auth if principal details are not present', async () => {
    ;(req.services.sessionService.getPrincipalDetails as jest.Mock).mockReturnValue(null)
    req.originalUrl = '/test-url'
    req.session = {} as Session

    const middleware = authorisationMiddleware()
    await middleware(req as Request, res as Response, next)

    expect(req.services!.sessionService.getPrincipalDetails).toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
    expect(res.redirect).toHaveBeenCalledWith('/sign-in/hmpps-auth')
    expect(req.session!.returnTo).toBe('/test-url')
  })

  it('calls next(HttpError) with 403 if the role is not present', async () => {
    ;(req.services.sessionService.getPrincipalDetails as jest.Mock).mockReturnValue({
      ...handoverData.principal,
      authType: AuthType.HMPPS_AUTH,
    })
    req.originalUrl = '/test-url'
    req.session = {} as Session
    req.user = { authSource: 'auth', username: 'user1', token: createUserToken([]) }

    const middleware = authorisationMiddleware()
    await middleware(req as Request, res as Response, next)

    expect(next).toHaveBeenCalledWith(expect.any(HttpError))
    expect((next as jest.Mock).mock.calls[0][0].status).toBe(403)
  })

  it('should call next if the role is present and canAccess is true', async () => {
    const mockGetData = jest.fn().mockResolvedValue({
        inCaseload: true,
        userExcluded: false,
        userRestricted: false,
        canAccess: true,
    })

    const req: any = {
      originalUrl: '/test-url',
      session: {} as Session,
      user: { authSource: 'auth', username: 'user1', token: createUserToken(['ROLE_SENTENCE_PLAN']) },
      services : {
        sessionService: {
          getPrincipalDetails: jest.fn().mockReturnValue({
            ...handoverData.principal,
            authType: 'HMPPS_AUTH'
          }),
        },
        sentencePlanAndDeliusService: {
          getDataByUsernameAndCrn: mockGetData,
        },
      }
    }

    const middleware = authorisationMiddleware()
    await middleware(req as Request, res as Response, next)

    expect(mockGetData).toHaveBeenCalledWith('user1', 'b')
    expect(next).toHaveBeenCalled()
  })

  it('calls next(HttpError) with 403 if canAccess is false', async () => {
    const mockGetData = jest.fn().mockResolvedValue({
      inCaseload: true,
      userExcluded: false,
      userRestricted: false,
      canAccess: false,
    })

    const req: any = {
      originalUrl: '/test-url',
      session: {} as Session,
      user: { authSource: 'auth', username: 'user1', token: createUserToken(['ROLE_SENTENCE_PLAN']) },
      services : {
        sessionService: {
          getPrincipalDetails: jest.fn().mockReturnValue({
            ...handoverData.principal,
            authType: 'HMPPS_AUTH'
          }),
        },
        sentencePlanAndDeliusService: {
          getDataByUsernameAndCrn: mockGetData,
        },
      }
    }

    const middleware = authorisationMiddleware()
    await middleware(req as Request, res as Response, next)

    expect(next).toHaveBeenCalledWith(expect.any(HttpError))
    expect((next as jest.Mock).mock.calls[0][0].status).toBe(403)
  })
})
