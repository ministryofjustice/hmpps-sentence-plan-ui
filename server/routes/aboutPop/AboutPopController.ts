import { NextFunction, Request, Response } from 'express'
import locale from './locale.json'
import { formatAssessmentData } from '../../utils/utils'

export default class AboutPopController {
  constructor() {}

  get = async (req: Request, res: Response, next: NextFunction) => {
    let { errors } = req
    try {
      const planUuid = req.services.sessionService.getPlanUUID()
      const popData = req.services.sessionService.getSubjectDetails()
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

      const assessmentAreas = formatAssessmentData(
        criminogenicNeedsData,
        assessmentData.sanAssessmentData,
        locale.en.areas,
      )
      const pageId = 'about'
      return res.render('pages/about-pop', {
        locale: locale.en,
        data: {
          pageId,
          deliusData,
          assessmentAreas,
        },
        errors,
      })
    } catch (e) {
      return next(e)
    }
  }
}
