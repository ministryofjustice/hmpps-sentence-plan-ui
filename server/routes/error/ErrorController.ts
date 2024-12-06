import { NextFunction, Request, Response } from 'express'
import type { HTTPError } from 'superagent'
import { constants as http } from 'http2'
import logger from '../../../logger'
import localeUnauthorized from './locale-unauthorized.json'
import localeForbidden from './locale-forbidden.json'
import localeBadRequest from './locale-bad-request.json'
import localeServiceFault from './locale-service-fault.json'

export default class ErrorController {
  constructor(private production = process.env.NODE_ENV === 'production') {}

  private errorHandler = async (error: HTTPError, req: Request, res: Response, next: NextFunction) => {
    this.logError(error, req.originalUrl, res.locals.user)

    res.locals.stack = this.production ? null : error.stack
    res.status(error.status || 500)

    switch (error.status - (error.status % 100)) {
      case 400:
        return this.handleBadRequestErrors(error, req, res, next)

      case 500:
      default:
        return this.handleServiceErrors(error, req, res, next)
    }
  }

  private logError = (error: HTTPError, url: string, user?: Express.User) => {
    logger.error(`Error handling request for '${url}', user '${user?.identifier}'`, error)
  }

  private handleBadRequestErrors = async (error: HTTPError, req: Request, res: Response, next: NextFunction) => {
    const oasysReturnUrl = req.services.sessionService.getOasysReturnUrl()

    switch (error.status) {
      case http.HTTP_STATUS_UNAUTHORIZED:
        return res.render('pages/error', {
          locale: localeUnauthorized.en,
          data: { oasysReturnUrl },
        })
      case http.HTTP_STATUS_FORBIDDEN:
        return res.render('pages/error', {
          locale: localeForbidden.en,
          data: { oasysReturnUrl },
        })
      default:
        return res.render('pages/error', {
          locale: localeBadRequest.en,
          data: { oasysReturnUrl },
        })
    }
  }

  private handleServiceErrors = async (error: HTTPError, req: Request, res: Response, next: NextFunction) => {
    return res.render('pages/error', {
      locale: localeServiceFault.en,
    })
  }

  any = this.errorHandler
}
