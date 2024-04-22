import logger from '../../logger'
import config from '../config'
import RestClient from './restClient'
import { ReferneceDataType } from '../interfaces/ReferenceDataType'

export default class SentencePlanApiClient {
  constructor() {}

  private static restClient(): RestClient {
    return new RestClient('Sentence Plan Api Client', config.apis.sentencePlanApi, null)
  }

  getHelloWorld(world: string): Promise<string> {
    logger.info('Calling hello world service')
    return SentencePlanApiClient.restClient().get<string>({ path: `/hello/${world}` })
  }

  getAllReferenceData(): Promise<ReferneceDataType> {
    logger.info('Getting question reference data')
    return SentencePlanApiClient.restClient().get<ReferneceDataType>({ path: `/question-reference-data` })
  }

  getPopData(crn: string) {
    // TODO: Not implemented on API yet
    return {
      title: 'Miss',
      firstName: 'Joan',
      lastName: 'Scott',
      gender: 'female',
      DoB: new Date('01/01/1997'),
      CRN: '12345678',
      PRC: 'ABC123XYZ',
      courtOrderRequirements: {},
    }
  }

  getNotesByAreaOfNeed(areaOfNeed: string, crn: string) {
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
