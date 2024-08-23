import { AreaOfNeed } from '../../@types/ReferenceDataType'
import { toKebabCase } from '../../utils/utils'
import referenceData from '../../data/referenceData'

export default class ReferentialDataService {
  constructor() {}

  getAreasOfNeed = (): Array<AreaOfNeed> => referenceData.map(({ id, name }) => ({ id, name, url: toKebabCase(name) }))

  getSortedAreasOfNeed = (): Array<AreaOfNeed> => this.getAreasOfNeed().sort((a, b) => a.name.localeCompare(b.name))

  getSteps = (areaOfNeed: string) =>
    referenceData
      .map(({ name, steps }) => ({ name: toKebabCase(name), steps }))
      .find(({ name, steps }) => name === areaOfNeed && steps)

  getGoals = (areaOfNeed: string) =>
    referenceData
      .map(({ name, goals }) => ({ name: toKebabCase(name), goals }))
      .find(({ name, goals }) => name === areaOfNeed && goals)
}
