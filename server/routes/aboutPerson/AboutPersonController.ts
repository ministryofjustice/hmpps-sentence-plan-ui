import { NextFunction, Request, Response } from 'express'
import locale from './locale.json'
import { formatAssessmentData } from '../../utils/assessmentUtils'
import { HttpError } from '../../utils/HttpError'
import { AccessMode } from '../../@types/Handover'

export default class AboutPersonController {
  constructor() {}

  get = async (req: Request, res: Response, next: NextFunction) => {
    let { errors } = req
    try {
      const planUuid = req.services.sessionService.getPlanUUID()
      const popData = req.services.sessionService.getSubjectDetails()
      const oasysReturnUrl = req.services.sessionService.getOasysReturnUrl()
      const deliusData = await req.services.infoService.getPopData(popData.crn)
      const criminogenicNeedsData = req.services.sessionService.getCriminogenicNeeds()
      const assessmentData = await req.services.assessmentService.getAssessmentByUuid(planUuid)
      const errorMessages = []

      if (assessmentData === null) {
        errorMessages.push('noAssessmentDataFound')
      }
      if (deliusData.sentences === null || deliusData.sentences.length === 0) {
        errorMessages.push('noSentenceDataFound')
      }
      if (errorMessages.length > 0) {
        errors = { domain: errorMessages }
      }

      const assessmentAreas = formatAssessmentData(criminogenicNeedsData, assessmentData, locale.en.areas)
      const pageId = 'about'
      const readWrite = req.services.sessionService.getAccessMode() === AccessMode.READ_WRITE

      const areas = [...assessmentAreas.lowScoring, ...assessmentAreas.highScoring, ...assessmentAreas.other]

      for (const area of areas) {
        if (area.isMissingInformation) {
          return res.render('pages/about-not-complete', {
            locale: locale.en,
            data: {
              oasysReturnUrl,
              pageId,
              deliusData,
              assessmentAreas,
              readWrite,
            },
            errors,
          })
        }
      }

      return res.render('pages/about', {
        locale: locale.en,
        data: {
          oasysReturnUrl,
          pageId,
          deliusData,
          assessmentAreas,
          readWrite,
        },
        errors,
      })
    } catch (e) {
      return next(HttpError(500, e.message))
    }
  }
}
