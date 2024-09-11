import nock from 'nock'

import config from '../config'
import HmppsAuthClient from './hmppsAuthClient'
import handoverData from '../testutils/data/handoverData'
import mockReq from '../testutils/preMadeMocks/mockReq'

jest.mock('./tokenStore/redisTokenStore')

const username = 'Dr.+Benjamin+Runolfsdottir'
const token = { token: 'token-1', expiresAt: Date.now() - 30 * 1000 }
const expiredToken = { token: 'token-1', expiresAt: Date.now() + 30 * 1000 }
const tokenFromHmppsAuth = { user_name: 'Bob', access_token: 'token-2', expires_in: '300' }

describe('hmppsAuthClient', () => {
  let fakeHmppsAuthApi: nock.Scope
  let hmppsAuthClient: HmppsAuthClient

  beforeEach(() => {
    fakeHmppsAuthApi = nock(config.apis.hmppsAuth.url)
    hmppsAuthClient = new HmppsAuthClient(mockReq())
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('getSystemClientToken', () => {
    it('should return existing token from session if a valid one exists', async () => {
      const spyGetToken = jest.spyOn(HmppsAuthClient.prototype as any, 'getToken')
      spyGetToken.mockReturnValue(token)

      const output = await hmppsAuthClient.getSystemClientToken()
      expect(output).toEqual(token.token)
    })

    it('should return new token from HMPPS Auth if session token expiry date has passed', async () => {
      const spyGetToken = jest.spyOn(HmppsAuthClient.prototype as any, 'getToken')
      const spySetToken = jest.spyOn(HmppsAuthClient.prototype as any, 'setToken')
      spyGetToken.mockReturnValue(expiredToken)

      hmppsAuthClient.req.services.sessionService.getPrincipalDetails = jest
        .fn()
        .mockReturnValue(handoverData.principal)

      fakeHmppsAuthApi
        .post('/oauth/token', `grant_type=client_credentials&username=${username}`)
        .basicAuth({ user: config.apis.hmppsAuth.systemClientId, pass: config.apis.hmppsAuth.systemClientSecret })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, tokenFromHmppsAuth)

      const output = await hmppsAuthClient.getSystemClientToken()
      expect(spySetToken).toHaveBeenCalled()
      expect(output).toEqual(tokenFromHmppsAuth.access_token)
    })

    it('should return token from HMPPS Auth without username', async () => {
      const spyGetToken = jest.spyOn(HmppsAuthClient.prototype as any, 'getToken')
      spyGetToken.mockReturnValue(token)

      fakeHmppsAuthApi
        .post('/oauth/token', 'grant_type=client_credentials')
        .basicAuth({ user: config.apis.hmppsAuth.systemClientId, pass: config.apis.hmppsAuth.systemClientSecret })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, token)

      const output = await hmppsAuthClient.getSystemClientToken()

      expect(output).toEqual(token.token)
    })
  })
})
