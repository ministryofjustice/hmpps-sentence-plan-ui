import passport from 'passport'
import flash from 'connect-flash'
import { Router } from 'express'
import { Strategy } from 'passport-oauth2'
import config from '../config'
import tokenVerifier from '../data/tokenVerification'
import generateOauthClientToken from '../authentication/clientCredentials'
import URLs from '../routes/URLs'

passport.serializeUser((user, done) => {
  // Not used but required for Passport
  done(null, user)
})

passport.deserializeUser((user, done) => {
  // Not used but required for Passport
  done(null, user as Express.User)
})

passport.use(
  new Strategy(
    {
      authorizationURL: `${config.apis.arnsHandover.externalUrl}/oauth2/authorize`,
      tokenURL: `${config.apis.arnsHandover.url}/oauth2/token`,
      clientID: config.apis.arnsHandover.clientId,
      clientSecret: config.apis.arnsHandover.clientSecret,
      callbackURL: `${config.domain}/sign-in/callback`,
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

export default function setupAuthentication() {
  const router = Router()

  router.use(passport.initialize())
  router.use(passport.session())
  router.use(flash())

  router.get('/autherror', (req, res) => {
    res.status(401)
    return res.render('autherror')
  })

  router.get('/sign-in', passport.authenticate('oauth2'))

  router.get('/sign-in/callback', (req, res, next) =>
    passport.authenticate('oauth2', {}, (err: any, user: Express.User) => {
      if (err) return next(err)
      if (!user) return res.redirect('/autherror')

      return req.logIn(user, loginErr => {
        if (err) return next(loginErr)

        return req.services.sessionService
          .setupSession()
          .then(() => res.redirect(req.session.returnTo || URLs.PLAN_OVERVIEW))
          .catch(next)
      })
    })(req, res, next),
  )

  const authUrl = config.apis.arnsHandover.url
  const authParameters = `client_id=${config.apis.arnsHandover.clientId}&redirect_uri=${config.domain}`

  router.use('/sign-out', (req, res, next) => {
    const authSignOutUrl = `${authUrl}/sign-out?${authParameters}`
    if (req.user) {
      req.logout(err => {
        if (err) return next(err)
        return req.session.destroy(() => res.redirect(authSignOutUrl))
      })
    } else res.redirect(authSignOutUrl)
  })

  router.use(async (req, res, next) => {
    if (req.isAuthenticated() && (await tokenVerifier(req))) {
      return next()
    }

    req.session.returnTo = req.originalUrl
    return res.redirect('/sign-in')
  })

  router.use((req, res, next) => {
    res.locals.user = { ...req.user, ...req.services.sessionService.getPrincipalDetails() }
    next()
  })

  return router
}
