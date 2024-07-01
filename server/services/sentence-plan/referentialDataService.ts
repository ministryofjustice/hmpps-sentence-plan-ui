import { AreaOfNeed } from '../../@types/ReferenceDataType'
import { toKebabCase } from '../../utils/utils'
import refenceData from '../../data/refenceData'

export default class ReferentialDataService {
  getAreasOfNeed = (): Array<AreaOfNeed> => refenceData.map(({ id, name }) => ({ id, name, url: toKebabCase(name) }))

  getSteps = (areaOfNeed: string) =>
    refenceData
      .map(({ name, steps }) => ({ name: toKebabCase(name), steps }))
      .find(({ name, steps }) => name === areaOfNeed && steps)

  getGoals = (areaOfNeed: string) =>
    refenceData
      .map(({ name, goals }) => ({ name: toKebabCase(name), goals }))
      .find(({ name, goals }) => name === areaOfNeed && goals)
}
