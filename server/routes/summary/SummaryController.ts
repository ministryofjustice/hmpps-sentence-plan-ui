import { Request, Response, NextFunction } from 'express'

export default class SummaryController {
  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.render('pages/summary')
    } catch (e) {
      next(e)
    }
  }
}
