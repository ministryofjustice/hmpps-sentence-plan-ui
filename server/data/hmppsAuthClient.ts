import { URLSearchParams } from 'url'

import superagent from 'superagent'

import type TokenStore from './tokenStore/tokenStore'
import logger from '../../logger'
import config from '../config'
import generateOauthClientToken from '../authentication/clientCredentials'
import RestClient from './restClient'
import { createRedisClient } from './redisClient'
import RedisTokenStore from './tokenStore/redisTokenStore'
import InMemoryTokenStore from './tokenStore/inMemoryTokenStore'

const timeoutSpec = config.apis.hmppsAuth.timeout
const hmppsAuthUrl = config.apis.hmppsAuth.url

function getSystemClientTokenFromHmppsAuth(username?: string): Promise<superagent.Response> {
  const clientToken = generateOauthClientToken(
    config.apis.hmppsAuth.systemClientId,
    config.apis.hmppsAuth.systemClientSecret,
  )

  const grantRequest = new URLSearchParams({
    grant_type: 'client_credentials',
    username, // todo
  }).toString()

  logger.info(`${grantRequest} HMPPS Auth request for client id. '${config.apis.hmppsAuth.systemClientId}''`)

  return superagent
    .post(`${hmppsAuthUrl}/oauth/token`)
    .set('Authorization', clientToken)
    .set('content-type', 'application/x-www-form-urlencoded')
    .send(grantRequest)
    .timeout(timeoutSpec)
}

export default class HmppsAuthClient {
  tokenStore: TokenStore

  req: Express.Request

  constructor(req: Express.Request) {
    this.req = req
    this.tokenStore = config.redis.enabled ? new RedisTokenStore(createRedisClient()) : new InMemoryTokenStore()
  }

  // todo can we delete this method?
  private static restClient(token: string): RestClient {
    return new RestClient('HMPPS Auth Client', config.apis.hmppsAuth, token)
  }

  async getSystemClientToken(username?: string): Promise<Record<string, string>> {
    // todo does this still need to handle 'anonymous' lookups?

    let newToken

    try {
      if (username) {
        const token = await this.tokenStore.getToken(username)
        if (token) {
          return { username, accessToken: token }
        }
      }

      newToken = await getSystemClientTokenFromHmppsAuth(
        this.req.services.sessionService.getPrincipalDetails().displayName,
      )

      // put this into the session

      // set TTL slightly less than expiry of token. Async but no need to wait
      await this.tokenStore.setToken(newToken.body.user_name, newToken.body.access_token, newToken.body.expires_in - 60)
    } catch (e) {
      console.log(e)
    }
    return { username: newToken.body.user_name, accessToken: newToken.body.access_token }
  }
}
