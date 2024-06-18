import SentencePlanApiClient from '../../data/sentencePlanApiClient'

export default class NoteService {
  constructor(private readonly sentencePlanApiClient: SentencePlanApiClient) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getNoteDataByAreaOfNeed(areaOfNeed: string, crn: string) {
    // TODO: Not implemented on API yet
    // TODO: Probably will return an array of notes, refactor later :)

    return {
      author: 'Joe Bloggs',
      source: 'assessment',
      creationDate: new Date(),
      content:
        'Joan may be required to seek independent accommodation and there needs ot be consideration made of the victim of her index offence, the need to protect her partner and their child and to minimise / prevent opportunities to frequent pro-offending peers.',
    }
  }
}
