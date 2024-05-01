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
    const crn = 'ABC123XYZ' // TODO: This is likely to be a session value, get from there
    const { errors } = req

    try {
      const referenceData = await this.buildReferenceData()
      const popData = await this.infoService.getPopData(crn)
      const roshData = await this.infoService.getRoSHData(crn)
      return res.render('pages/about-pop', {
        roshData,
        locale: locale.en,
        data: {
          referenceData,
          popData,
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
