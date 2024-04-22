import SentencePlanApiClient from '../../data/sentencePlanApiClient'

export default class NoteService {
  constructor(private readonly sentencePlanApiClient: SentencePlanApiClient) {}

  getNoteDataByAreaOfNeed(areaOfNeed: string, crn: string) {
    return this.sentencePlanApiClient.getNotesByAreaOfNeed(areaOfNeed, crn)
  }
}
