import passport from 'passport'
import { Strategy } from 'passport-oauth2'
import type { RequestHandler } from 'express'

import config from '../config'
import generateOauthClientToken from './clientCredentials'
import type { TokenVerifier } from '../data/tokenVerification'

passport.serializeUser((user, done) => {
  // Not used but required for Passport
  done(null, user)
})

passport.deserializeUser((user, done) => {
  // Not used but required for Passport
  done(null, user as Express.User)
})

export type AuthenticationMiddleware = (tokenVerifier: TokenVerifier) => RequestHandler

const authenticationMiddleware: AuthenticationMiddleware = verifyToken => {
  return async (req, res, next) => {
    if (req.isAuthenticated() && (await verifyToken(req))) {
      return next()
    }
    req.session.returnTo = req.originalUrl
    return res.redirect('/sign-in')
  }
}

function init(): void {
  const strategy = new Strategy(
    {
      authorizationURL: `${config.apis.hmppsHandover.url}/oauth2/authorize`,
      tokenURL: `${config.apis.hmppsHandover.url}/oauth2/token`,
      clientID: config.apis.hmppsHandover.clientId,
      clientSecret: config.apis.hmppsHandover.clientSecret,
      callbackURL: `${config.domain}/sign-in/callback`,
      state: true,
      customHeaders: {
        Authorization: generateOauthClientToken(
          config.apis.hmppsHandover.clientId,
          config.apis.hmppsHandover.clientSecret,
        ),
      },
      scope: 'openid profile',
    },
    (token, refreshToken, params, profile, done) => {
      return done(null, { token, username: params.user_name, authSource: params.auth_source })
    },
  )

  passport.use(strategy)
}

export default {
  authenticationMiddleware,
  init,
}
