import { Request } from 'express'
import HandoverApiClient from '../../data/handoverApiClient'
import { HandoverContextData } from '../../@types/Handover'

export default class HandoverContextService {
  constructor(
    private readonly req: Request,
    private readonly handoverApiClient = new HandoverApiClient(),
  ) {}

  getToken = () => this.req.res.locals?.user?.token

  async getContext(): Promise<HandoverContextData> {
    return this.handoverApiClient.getContextData(this.getToken())
  }
}
