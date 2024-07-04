import { NextFunction, Request, Response } from 'express'
import locale from './locale.json'
import InfoService from '../../services/sentence-plan/infoService'
import ReferentialDataService from '../../services/sentence-plan/referentialDataService'

export default class AboutPopController {
  constructor(
    private readonly referentialDataService: ReferentialDataService,
    private readonly infoService: InfoService,
  ) {}

  get = async (req: Request, res: Response, next: NextFunction) => {
    const { errors } = req

    try {
      const popData = req.services.sessionService.getSubjectDetails()
      const referenceData = this.referentialDataService.getAreasOfNeed().slice(0, 3)
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
}
