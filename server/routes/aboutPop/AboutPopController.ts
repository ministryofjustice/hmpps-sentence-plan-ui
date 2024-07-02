import { NextFunction, Request, Response } from 'express'
import locale from './locale.json'
import InfoService from '../../services/sentence-plan/infoService'
import ReferentialDataService from '../../services/sentence-plan/referentialDataService'
import { toKebabCase } from '../../utils/utils'

export default class AboutPopController {
  constructor(
    private readonly referentialDataService: ReferentialDataService,
    private readonly infoService: InfoService,
  ) {}

  render = async (req: Request, res: Response, next: NextFunction) => {
    const { errors } = req

    try {
      const popData = req.services.sessionService.getSubjectDetails()
      const referenceData = await this.buildReferenceData()
      const roshData = await this.infoService.getRoSHData(popData.crn)
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
