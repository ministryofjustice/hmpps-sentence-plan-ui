import HandoverApiClient from '../../data/handoverApiClient'
import { HandoverContextData } from '../../@types/Handover'

export default class HandoverContextService {
  constructor(private readonly handoverApiClient = new HandoverApiClient()) {}

  async getContext(handoverToken: string): Promise<HandoverContextData> {
    return this.handoverApiClient.getContextData(handoverToken)
  }
}
