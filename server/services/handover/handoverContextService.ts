import { Request } from 'express'
import HandoverApiClient from '../../data/handoverApiClient'

export default class HandoverContextService {
  constructor(
    private readonly req: Request,
    private readonly handoverApiClient = new HandoverApiClient(),
  ) {}

  getToken = () => this.req.res.locals?.user?.token

  async getContext() {
    const data = await this.handoverApiClient.getContextData(this.getToken())
    return data
  }
}
