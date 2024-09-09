import nock from 'nock'

import config from '../config'
import HmppsAuthClient from './hmppsAuthClient'
import TokenStore from './tokenStore/redisTokenStore'
import handoverData from '../testutils/data/handoverData'
import mockReq from '../testutils/preMadeMocks/mockReq'

jest.mock('./tokenStore/redisTokenStore')

const tokenStore = new TokenStore(null) as jest.Mocked<TokenStore>

const username = 'Dr.+Benjamin+Runolfsdottir'
const token = { user_name: username, access_token: 'token-1', expires_in: 300 }

jest.mock('../services/sessionService', () => {
  return jest.fn().mockImplementation(() => ({
    getPrincipalDetails: jest.fn().mockReturnValue(handoverData.principal),
  }))
})

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
    it('should instantiate the redis client', async () => {
      tokenStore.getToken.mockResolvedValue(token.access_token)
      await hmppsAuthClient.getSystemClientToken(username)
    })

    it('should return token from redis if one exists', async () => {
      tokenStore.getToken.mockResolvedValue(token.access_token)
      hmppsAuthClient.tokenStore = tokenStore
      const output = await hmppsAuthClient.getSystemClientToken(username)
      expect(output).toEqual({ username, token: token.access_token })
    })

    it('should return token from HMPPS Auth with username', async () => {
      tokenStore.getToken.mockResolvedValue(null)

      fakeHmppsAuthApi
        .post('/oauth/token', `grant_type=client_credentials&username=${username}`)
        .basicAuth({ user: config.apis.hmppsAuth.systemClientId, pass: config.apis.hmppsAuth.systemClientSecret })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, token)

      const output = await hmppsAuthClient.getSystemClientToken(username)

      expect(output).toEqual({ username, accessToken: token.access_token })
      expect(tokenStore.setToken).toBeCalledWith(token.user_name, token.access_token, 240)
    })

    it('should return token from HMPPS Auth without username', async () => {
      tokenStore.getToken.mockResolvedValue(null)

      fakeHmppsAuthApi
        .post('/oauth/token', 'grant_type=client_credentials')
        .basicAuth({ user: config.apis.hmppsAuth.systemClientId, pass: config.apis.hmppsAuth.systemClientSecret })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, token)

      const output = await hmppsAuthClient.getSystemClientToken()

      expect(output).toEqual(token.access_token)
      expect(tokenStore.setToken).toBeCalledWith('%ANONYMOUS%', token.access_token, 240)
    })
  })
})
