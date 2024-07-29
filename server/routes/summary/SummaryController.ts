import { Request, Response, NextFunction } from 'express'
import InfoService from '../../services/sentence-plan/infoService'

export default class SummaryController {
  constructor(private readonly infoService: InfoService) {}

  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const popData = await req.services.sessionService.getSubjectDetails()
      res.render('pages/summary', { data: { popData } })
    } catch (e) {
      next(e)
    }
  }
}
