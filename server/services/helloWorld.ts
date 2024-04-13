import logger from '../../logger'
import config from '../config'
import RestClient from '../data/restClient'

export default class HelloWorldService {
  constructor() {}

  private static restClient(): RestClient {
    return new RestClient('Hello world', config.apis.helloWorld, null)
  }

  helloWorld(world: string): Promise<string> {
    logger.info('Calling hello world service')
    return HelloWorldService.restClient().get<string>({ path: `/${world}` })
  }
}
