import { Request, Response, NextFunction } from 'express'
import { Session } from 'express-session'
import authorisationMiddleware from './authorisationMiddleware'
import handoverData from '../testutils/data/handoverData'
import createUserToken from '../testutils/createUserToken'
import { HttpError } from '../utils/HttpError'
import { AccessMode, AuthType } from '../@types/SessionType'

jest.mock('../services/sessionService', () => {
  return jest.fn().mockImplementation(() => ({
    getPrincipalDetails: jest.fn().mockReturnValue(handoverData.principal),
    getSubjectDetails: jest.fn().mockReturnValue({}),
  }))
})

jest.mock('../services/sentence-plan/sentencePlanAndDeliusService', () => {
  return jest.fn().mockImplementation(() => ({
    getDataByUsernameAndCrn: jest.fn(),
  }))
})

function createReqResNext() {
  const req: any = {
    originalUrl: '/test-url',
    session: {} as Session,
    services: {
      sessionService: {
        getPrincipalDetails: jest.fn().mockReturnValue(handoverData.principal),
        getSubjectDetails: jest.fn().mockReturnValue({}),
      },
      sentencePlanAndDeliusService: {
        getDataByUsernameAndCrn: jest.fn(),
      },
    },
  }

  const res: Partial<Response> = {
    redirect: jest.fn(),
  }

  const next: NextFunction = jest.fn()

  return { req, res, next }
}

describe('authorisationMiddleware', () => {
  it('calls next if READ_WRITE principal details are present', async () => {
    const { req, res, next } = createReqResNext()
    req.services.sessionService.getPrincipalDetails.mockReturnValue({})

    await authorisationMiddleware()(req as Request, res as Response, next)

    expect(next).toHaveBeenCalledWith()
    expect(res.redirect).not.toHaveBeenCalled()
  })

  it('calls next if READ_ONLY principal details are present', async () => {
    const { req, res, next } = createReqResNext()
    req.services.sessionService.getPrincipalDetails.mockReturnValue({
      ...handoverData.principal,
      accessMode: AccessMode.READ_ONLY,
    })

    await authorisationMiddleware()(req as Request, res as Response, next)

    expect(next).toHaveBeenCalledWith()
  })

  it('redirects if principal details are not present', async () => {
    const { req, res, next } = createReqResNext()
    req.services.sessionService.getPrincipalDetails.mockReturnValue(null)

    await authorisationMiddleware()(req as Request, res as Response, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.redirect).toHaveBeenCalledWith('/sign-in/hmpps-auth')
    expect(req.session.returnTo).toBe('/test-url')
  })

  it('denies access if role is missing', async () => {
    const { req, res, next } = createReqResNext()
    req.services.sessionService.getPrincipalDetails.mockReturnValue({
      ...handoverData.principal,
      authType: AuthType.HMPPS_AUTH,
    })
    req.user = { username: 'user1', token: createUserToken([]) }

    await authorisationMiddleware()(req as Request, res as Response, next)

    expect(next).toHaveBeenCalledWith(expect.any(HttpError))
    expect((next as jest.Mock).mock.calls[0][0].status).toBe(403)
  })

  it('allows access if role present and canAccess is true', async () => {
    const { req, res, next } = createReqResNext()
    req.services.sessionService.getPrincipalDetails.mockReturnValue({
      ...handoverData.principal,
      authType: AuthType.HMPPS_AUTH,
    })
    req.services.sessionService.getSubjectDetails.mockReturnValue({ crn: 'X000001' })
    req.services.sentencePlanAndDeliusService.getDataByUsernameAndCrn.mockResolvedValue({
      canAccess: true,
    })
    req.user = { username: 'user1', token: createUserToken(['ROLE_SENTENCE_PLAN']) }

    await authorisationMiddleware()(req as Request, res as Response, next)

    expect(req.services.sentencePlanAndDeliusService.getDataByUsernameAndCrn).toHaveBeenCalledWith('user1', 'X000001')
    expect(next).toHaveBeenCalledWith()
  })

  it('denies access if role present but canAccess is false', async () => {
    const { req, res, next } = createReqResNext()
    req.services.sessionService.getPrincipalDetails.mockReturnValue({
      ...handoverData.principal,
      authType: AuthType.HMPPS_AUTH,
    })
    req.services.sessionService.getSubjectDetails.mockReturnValue({ crn: 'X000001' })
    req.services.sentencePlanAndDeliusService.getDataByUsernameAndCrn.mockResolvedValue({
      canAccess: false,
    })
    req.user = { username: 'user1', token: createUserToken(['ROLE_SENTENCE_PLAN']) }

    await authorisationMiddleware()(req as Request, res as Response, next)

    expect(next).toHaveBeenCalledWith(expect.any(HttpError))
    expect((next as jest.Mock).mock.calls[0][0].status).toBe(403)
  })
})
