import { NextFunction, Request, Response } from 'express'
import locale from './locale.json'

import URLs from '../URLs'
import transformRequest from '../../middleware/transformMiddleware'
import validateRequest from '../../middleware/validationMiddleware'
import { requireAccessMode } from '../../middleware/authorisationMiddleware'
import { AccessMode } from '../../@types/Handover'
import PrivacyScreenPostModel from './models/PrivacyScreenPostModel'
import { HttpError } from '../../utils/HttpError'

export default class PrivacyScreenController {
  private redirect = async (req: Request, res: Response, next: NextFunction) => {
    return res.redirect(URLs.PLAN_OVERVIEW)
  }

  private render = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { errors } = req

      return res.render('pages/privacy-screen', {
        locale: locale.en,
        data: {
          privacyScreen: true, // hides the navigation bar from the page
          systemReturnUrl: req.services.sessionService.getSystemReturnUrl(),
          form: req.body,
        },
        errors,
      })
    } catch (e) {
      return next(HttpError(500, e.message))
    }
  }

  private handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    if (Object.keys(req.errors.body).length) {
      return this.render(req, res, next)
    }
    return next()
  }

  get = [requireAccessMode(AccessMode.READ_WRITE), this.render]

  post = [
    requireAccessMode(AccessMode.READ_WRITE),
    transformRequest({
      body: PrivacyScreenPostModel,
    }),
    validateRequest(),
    this.handleValidationErrors,
    this.redirect,
  ]
}
