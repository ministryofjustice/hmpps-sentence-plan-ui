import type { Router } from 'express'
import express from 'express'
import passport from 'passport'
import flash from 'connect-flash'
import config from '../config'
import auth from '../authentication/auth'

const router = express.Router()

export default function setUpAuth(): Router {
  auth.init()

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
          .then(() => res.redirect(req.session.returnTo || '/plan-summary'))
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

  router.use((req, res, next) => {
    res.locals.user = { ...req.user, ...req.services.sessionService.getPrincipalDetails() }
    next()
  })

  return router
}
