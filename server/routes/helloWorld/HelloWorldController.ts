import { Request, Response, NextFunction } from 'express'
import HelloWorldService from '../../services/sentence-plan/helloWorld'

export default class HelloWorldController {
  constructor(private readonly helloWorldService: HelloWorldService) {}

  get = async (req: Request, res: Response, next: NextFunction) => {
    const { q } = req.params

    try {
      const response = await this.helloWorldService.helloWorld(q)
      res.render('pages/hello-world', { q, response })
    } catch (e) {
      next(e)
    }
  }
}
