import { Request, Response, NextFunction } from 'express'
import InfoService from '../../services/sentence-plan/infoService'

export default class SummaryController {
  constructor(private readonly infoService: InfoService) {}

  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const crn = 'ABC123XYZ'
      const popData = await Promise.resolve(this.infoService.getPopData(crn))
      res.render('pages/summary', { popData })
    } catch (e) {
      next(e)
    }
  }
}
