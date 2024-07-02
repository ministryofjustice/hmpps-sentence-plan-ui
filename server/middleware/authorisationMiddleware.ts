import type { RequestHandler } from 'express'

export default function authorisationMiddleware(): RequestHandler {
  return (req, res, next) => {
    if (req.services.sessionService.getPrincipalDetails()) {
      return next()
    }

    req.session.returnTo = req.originalUrl
    return res.redirect('/sign-in')
  }
}
