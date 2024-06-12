import { NextFunction, Request, Response } from 'express'
import locale from './locale.json'
import InfoService from '../../services/sentence-plan/infoService'
import ReferentialDataService from '../../services/sentence-plan/referentialDataService'
import { toKebabCase } from '../../utils/utils'
import { HandoverContextData } from '../../@types/Handover'

export default class AboutPopController {
  constructor(
    private readonly referentialDataService: ReferentialDataService,
    private readonly infoService: InfoService,
  ) {}

  render = async (req: Request, res: Response, next: NextFunction) => {
    const { errors } = req

    try {
      const contextData: HandoverContextData = await req.services.handoverContextService.getContext()
      const { crn, dateOfBirth } = contextData.subject
      const popData = {
        ...contextData.subject,
        dateOfBirth: new Date(dateOfBirth).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
      }
      const referenceData = await this.buildReferenceData()
      // comented out till we are clear which data we will receive from this service
      // const popData = await this.infoService.getPopData(crn)
      const roshData = await this.infoService.getRoSHData(crn)
      return res.render('pages/about-pop', {
        locale: locale.en,
        data: {
          referenceData,
          popData,
          roshData,
        },
        errors,
      })
    } catch (e) {
      return next(e)
    }
  }

  get = this.render

  private buildReferenceData = async () => {
    const referenceData = await this.referentialDataService.getAreasOfNeedQuestionData()
    return referenceData.map(areaOfNeed => ({
      ...areaOfNeed,
      url: toKebabCase(areaOfNeed.Name),
    }))
  }
}
