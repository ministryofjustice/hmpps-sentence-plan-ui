import { ReferenceData } from '../../@types/ReferenceDataType'
import SentencePlanApiClient from '../../data/sentencePlanApiClient'
import { toKebabCase } from '../../utils/utils'

export default class ReferentialDataService {
  private cachedResult: ReferenceData

  constructor(private readonly sentencePlanApiClient: SentencePlanApiClient) {}

  async getAllReferenceData(): Promise<ReferenceData> {
    const restClient = await this.sentencePlanApiClient.restClient('Getting question reference data')
    return restClient.get<ReferenceData>({ path: `/question-reference-data` })
  }

  async getAllQuestionData(): Promise<ReferenceData> {
    if (!this.cachedResult) {
      this.cachedResult = await this.getAllReferenceData()
    }
    return this.cachedResult
  }

  async getAreasOfNeedQuestionData() {
    const { AreasOfNeed } = await this.getAllQuestionData()
    return AreasOfNeed.map((area: any) => ({
      id: area.id,
      Name: area.Name,
      active: area.active,
    }))
  }

  async getQuestionDataByAreaOfNeed(areaOfNeed: string) {
    const { AreasOfNeed } = await this.getAllQuestionData()
    return AreasOfNeed.find((area: any) => toKebabCase(area.Name) === areaOfNeed)
  }

  async getReferenceData(): Promise<any> {
    const referenceData = await this.getAreasOfNeedQuestionData()
    return referenceData.map((areaOfNeed: any) => ({
      ...areaOfNeed,
      url: toKebabCase(areaOfNeed.Name),
    }))
  }
}
