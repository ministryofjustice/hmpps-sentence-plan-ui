import { URLSearchParams } from 'url'

import superagent from 'superagent'

import logger from '../../logger'
import config from '../config'
import generateOauthClientToken from '../authentication/clientCredentials'
import SessionService from '../services/sessionService'

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
  constructor(readonly sessionService: SessionService) {}

  async getSystemClientToken(): Promise<string> {
    if (this.sessionService.getToken()?.expiresAt < Date.now()) {
      return this.sessionService.getToken().token
    }

    const newToken = await getSystemClientTokenFromHmppsAuth(this.sessionService.getPrincipalDetails().displayName)

    await this.sessionService.setToken({
      token: newToken.body.access_token,
      expiresAt: Date.now() + newToken.body.expires_in * 1000,
    })

    return newToken.body.access_token
  }
}
