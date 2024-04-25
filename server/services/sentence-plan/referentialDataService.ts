import SentencePlanApiClient from '../../data/sentencePlanApiClient'
import { toKebabCase } from '../../utils/utils'

export default class ReferentialDataService {
  constructor(private readonly sentencePlanApiClient: SentencePlanApiClient) {}

  getAllQuestionData() {
    return this.sentencePlanApiClient.getAllReferenceData()
  }

  getAreasOfNeedQuestionData() {
    return this.getAllQuestionData().then(({ AreasOfNeed }) => {
      return AreasOfNeed.map((area: any) => ({
        id: area.id,
        Name: area.Name,
        active: area.active,
      }))
    })
  }

  getQuestionDataByAreaOfNeed(areaOfNeed: string) {
    return this.getAllQuestionData().then(({ AreasOfNeed }) => {
      return AreasOfNeed.find(area => toKebabCase(area.Name) === areaOfNeed)
    })
  }
}
