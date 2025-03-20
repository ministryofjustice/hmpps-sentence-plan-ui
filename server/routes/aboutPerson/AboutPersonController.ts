import { NextFunction, Request, Response } from 'express'
import locale from './locale.json'
import { areaConfigs } from '../../utils/assessmentAreaConfig.json'
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
      const criminogenicNeedsData = req.services.sessionService.getCriminogenicNeeds()
      const plan = await req.services.planService.getPlanByUuid(planUuid)
      const errorMessages = []

      const deliusData = await req.services.infoService.getPopData(popData.crn).catch((): null => null)
      const assessmentData = await req.services.assessmentService.getAssessmentByUuid(planUuid).catch((): null => null)

      if (deliusData === null && assessmentData !== null) {
        errorMessages.push('noDeliusDataFound')
      } else if (deliusData !== null && assessmentData === null) {
        errorMessages.push('noAssessmentDataFound')
      } else if (deliusData === null && assessmentData === null) {
        return next(HttpError(500))
      }

      if (errorMessages.length > 0) {
        errors = { domain: errorMessages }
      }

      const formattedAssessmentInfo = formatAssessmentData(criminogenicNeedsData, assessmentData, areaConfigs)
      const pageId = 'about'
      const readWrite = req.services.sessionService.getAccessMode() === AccessMode.READ_WRITE

      req.services.sessionService.setReturnLink(`/about`)

      return res.render('pages/about', {
        locale: locale.en,
        data: {
          planAgreementStatus: plan.agreementStatus,
          oasysReturnUrl,
          pageId,
          deliusData,
          formattedAssessmentInfo,
          readWrite,
        },
        errors,
      })
    } catch (e) {
      return next(HttpError(500, e.message))
    }
  }
}
