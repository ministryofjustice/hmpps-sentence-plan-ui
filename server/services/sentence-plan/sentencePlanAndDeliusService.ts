import SentencePlanAndDeliusApiClient from "../../data/SentencePlanAndDeliusApiClient";
import {PlanType} from "../../@types/PlanType";

export default class SentencePlanAndDeliusService {
  constructor(private readonly sentencePlanAndDeliusApiClient: SentencePlanAndDeliusApiClient) {}

  async getDataByUsernameAndCrn(username: string, crn: string) {
    const restClient = await this.sentencePlanAndDeliusApiClient.restClient(`Getting access data for user ${username} for CRN ${crn}`);
    return restClient.get<PlanType>({ path: `/users/${username}/access/${crn}` })
  }
}
