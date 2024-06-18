import { Request, Response, NextFunction } from 'express'
import StepService from '../../services/sentence-plan/stepsService'
import InfoService from '../../services/sentence-plan/infoService'
import ReferentialDataService from '../../services/sentence-plan/referentialDataService'

export default class StepsController {
  constructor(
    private readonly stepService: StepService,
    private readonly referentialDataService: ReferentialDataService,
    private readonly infoService: InfoService,
  ) {}

  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const fileds = [
        'Probation practitioner',
        'Programme staff',
        'Partnership agency',
        'Commissioned rehabilitative services (CRS) provider',
        'Someone else',
      ]
      res.render('pages/create-step', { fileds })
    } catch (e) {
      next(e)
    }
  }
}
