import { faker } from '@faker-js/faker'
import { NewGoal } from '../../server/@types/NewGoalType'
import { NewStep } from '../../server/@types/NewStepType'
import { AreaOfNeed } from '../../server/testutils/data/referenceData'

export default class DataGenerator {
  static generateGoal = (): NewGoal => ({
    title: faker.lorem.sentence(8),
    areaOfNeed: DataGenerator.getRandomAreaOfNeed(),
    relatedAreasOfNeed: [DataGenerator.getRandomAreaOfNeed()],
    targetDate: faker.date.future({ years: 1, refDate: new Date() }).toISOString().split('T')[0],
  })

  static generateStep = (): NewStep => ({
    description: faker.lorem.lines(1),
    status: faker.helpers.arrayElement(['INACTIVE', 'ACTIVE', 'COMPLETED']),
    actor: [
      {
        actor: 'Probation practitioner',
        actorOptionId: 2,
      },
    ],
  })

  private static getRandomAreaOfNeed = () => {
    return faker.helpers.arrayElement(AreaOfNeed.map(x => x.name))
  }
}
