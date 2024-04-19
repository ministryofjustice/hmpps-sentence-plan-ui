import SentencePlanApiClient from '../data/sentencePlanApiClient'

// TODO: This is a test service and can be removed once we've added other API calls
export default class HelloWorldService {
  constructor(private readonly sentencePlanApiClient: SentencePlanApiClient) {}

  helloWorld(world: string): Promise<string> {
    return this.sentencePlanApiClient.getHelloWorld(world)
  }
}
