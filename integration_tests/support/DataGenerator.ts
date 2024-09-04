import { faker } from '@faker-js/faker'
import { NewGoal } from '../../server/@types/NewGoalType'
import { AreaOfNeed } from '../../server/testutils/data/referenceData'
import { NewStep, StepStatus } from '../../server/@types/StepType'

export default class DataGenerator {
  static generateGoal = (overrides: Partial<NewGoal>): NewGoal => ({
    title: faker.lorem.sentence(8),
    areaOfNeed: DataGenerator.getRandomAreaOfNeed(),
    relatedAreasOfNeed: [DataGenerator.getRandomAreaOfNeed()],
    targetDate: faker.date.future({ years: 1, refDate: new Date() }).toISOString().split('T')[0],
    ...overrides,
  })

  static generateStep = (overrides: Partial<NewStep>): NewStep => ({
    description: faker.lorem.lines(1),
    status: faker.helpers.arrayElement([StepStatus.NOT_STARTED, StepStatus.IN_PROGRESS, StepStatus.COMPLETED]),
    actor: 'Probation practitioner',
    ...overrides,
  })

  private static getRandomAreaOfNeed = () => {
    return faker.helpers.arrayElement(AreaOfNeed.map(x => x.name))
  }
}
