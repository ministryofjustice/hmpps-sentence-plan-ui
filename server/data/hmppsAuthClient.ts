import { URLSearchParams } from 'url'

import superagent from 'superagent'

import logger from '../../logger'
import config from '../config'
import { generateOauthClientToken } from '../utils/utils'
import { Token } from '../@types/Token'

const timeoutSpec = config.apis.hmppsAuth.timeout
const hmppsAuthUrl = config.apis.hmppsAuth.url

function getSystemClientTokenFromHmppsAuth(identifier: string, username?: string): Promise<superagent.Response> {
  const clientToken = generateOauthClientToken(
    config.apis.hmppsAuth.systemClientId,
    config.apis.hmppsAuth.systemClientSecret,
  )

  const grantRequest = new URLSearchParams({
    grant_type: 'client_credentials',
    username: `${identifier}|${username}`,
  }).toString()

  logger.info(`HMPPS Auth request for client id. '${config.apis.hmppsAuth.systemClientId}'`)

  return superagent
    .post(`${hmppsAuthUrl}/oauth/token`)
    .set('Authorization', clientToken)
    .set('content-type', 'application/x-www-form-urlencoded')
    .send(grantRequest)
    .timeout(timeoutSpec)
}

export default class HmppsAuthClient {
  constructor(readonly req: Express.Request) {}

  private getToken() {
    return this.req.session.token
  }

  private setToken(token: Token) {
    this.req.session.token = token
  }

  async getSystemClientToken(): Promise<string> {
    if (this.getToken()?.expiresAt < Date.now()) {
      return this.getToken().token
    }

    const newToken = await getSystemClientTokenFromHmppsAuth(
      this.req.services.sessionService.getPrincipalDetails().identifier,
      this.req.services.sessionService.getPrincipalDetails().displayName,
    )

    await this.setToken({
      token: newToken.body.access_token,
      expiresAt: Date.now() + newToken.body.expires_in * 1000,
    })

    return newToken.body.access_token
  }
}
