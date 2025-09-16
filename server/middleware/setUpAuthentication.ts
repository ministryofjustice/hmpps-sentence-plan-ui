import passport from 'passport'
import flash from 'connect-flash'
import { Router } from 'express'
import { Strategy } from 'passport-oauth2'
import { VerificationClient, AuthenticatedRequest } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import { generateOauthClientToken } from '../utils/utils'
import URLs from '../routes/URLs'
import { HttpError } from '../utils/HttpError'
import logger from '../../logger'
import { AccessMode } from '../@types/SessionType'

passport.serializeUser((user, done) => {
  // Not used but required for Passport
  done(null, user)
})

passport.deserializeUser((user, done) => {
  // Not used but required for Passport
  done(null, user as Express.User)
})

passport.use(
  'handover-oauth2',
  new Strategy(
    {
      authorizationURL: `${config.apis.arnsHandover.externalUrl}/oauth2/authorize`,
      tokenURL: `${config.apis.arnsHandover.url}/oauth2/token`,
      clientID: config.apis.arnsHandover.clientId,
      clientSecret: config.apis.arnsHandover.clientSecret,
      callbackURL: `${config.domain}/sign-in/handover/callback`,
      state: true,
      customHeaders: {
        Authorization: generateOauthClientToken(
          config.apis.arnsHandover.clientId,
          config.apis.arnsHandover.clientSecret,
        ),
      },
      scope: 'openid profile',
    },
    (token, refreshToken, params, profile, done) => {
      return done(null, { token, username: params.user_name, authSource: params.auth_source })
    },
  ),
)

// default name is 'oauth2', but can specify name as first parameter
passport.use(
  new Strategy(
    {
      authorizationURL: `${config.apis.hmppsAuth.externalUrl}/oauth/authorize`,
      tokenURL: `${config.apis.hmppsAuth.url}/oauth/token`,
      clientID: config.apis.hmppsAuth.apiClientId,
      clientSecret: config.apis.hmppsAuth.apiClientSecret,
      callbackURL: `${config.domain}/sign-in/hmpps-auth/callback`,
      state: true,
      customHeaders: {
        Authorization: generateOauthClientToken(
          config.apis.hmppsAuth.apiClientId,
          config.apis.hmppsAuth.apiClientSecret,
        ),
      },
    },
    (token, refreshToken, params, profile, done) => {
      return done(null, { token, username: params.user_name, authSource: params.auth_source })
    },
  ),
)

export default function setupAuthentication() {
  const router = Router()
  const tokenVerificationClient = new VerificationClient(config.apis.tokenVerification, logger)

  router.use(passport.initialize())
  router.use(passport.session())
  router.use(flash())

  router.get('/sign-in/hmpps-auth', passport.authenticate('oauth2'))

  router.get('/sign-in/hmpps-auth/callback', (req, res, next) =>
    passport.authenticate('oauth2', {}, (err: any, user: Express.User) => {
      if (err) return next(err)
      if (!user) throw new HttpError(401)

      return req.logIn(user, loginErr => {
        if (err) return next(loginErr)

        return req.services.sessionService
          .setupAuthSession()
          .then(() => {
            res.redirect(URLs.PLAN_OVERVIEW)
          })
          .catch(next)
      })
    })(req, res, next),
  )

  router.get('/sign-in/handover', passport.authenticate('handover-oauth2'))

  router.get('/sign-in/handover/callback', (req, res, next) =>
    passport.authenticate('handover-oauth2', {}, (err: any, user: Express.User) => {
      if (err) return next(err)
      if (!user) throw new HttpError(401)

      return req.logIn(user, loginErr => {
        if (err) return next(loginErr)

        return req.services.sessionService
          .setupSession()
          .then(() => {
            const redirectURL =
              req.session.returnTo ||
              (req.services.sessionService.getAccessMode() === AccessMode.READ_WRITE
                ? URLs.DATA_PRIVACY
                : URLs.PLAN_OVERVIEW)
            res.redirect(redirectURL)
          })
          .catch(next)
      })
    })(req, res, next),
  )

  router.use('/sign-out', (req, res, next) => {
    const authUrl = config.apis.hmppsAuth.externalUrl
    const authParameters = `client_id=${config.apis.hmppsAuth.systemClientId}&redirect_uri=${config.domain}/sign-in/hmpps-auth/`
    const authSignOutUrl = `${authUrl}/sign-out?${authParameters}`
    if (req.user) {
      req.logout(err => {
        if (err) return next(err)
        return req.session.destroy(() => res.redirect(authSignOutUrl))
      })
    } else res.redirect(authSignOutUrl)
  })

  router.use(async (req, res, next) => {
    if (req?.user?.authSource === 'auth') {
      if (
        req.isAuthenticated() &&
        (await tokenVerificationClient.verifyToken(req as unknown as AuthenticatedRequest))
      ) {
        return next()
      }
      req.session.returnTo = req.originalUrl
      return res.redirect('/sign-in/hmpps-auth')
    }
    // Do we verify the handover token anywhere?
    return next()
  })

  router.use((req, res, next) => {
    res.locals.user = { ...req.user, ...req.services.sessionService.getPrincipalDetails() }
    next()
  })

  return router
}
