import { NextFunction, Request, Response } from 'express'
import locale from './locale.json'
import ReferentialDataService from '../../services/sentence-plan/referentialDataService'

export default class AboutPopController {
  constructor(private readonly referentialDataService: ReferentialDataService) {}

  get = async (req: Request, res: Response, next: NextFunction) => {
    const { errors } = req

    try {
      const popData = req.services.sessionService.getSubjectDetails()
      const areasOfNeed = this.referentialDataService.getAreasOfNeed()
      const referenceData = Array.isArray(areasOfNeed) ? areasOfNeed.slice(0, 3) : []
      const roshData = await req.services.infoService.getRoSHData(popData.crn)
      return res.render('pages/about-pop', {
        locale: locale.en,
        data: {
          referenceData,
          roshData,
        },
        errors,
      })
    } catch (e) {
      return next(e)
    }
  }
}
