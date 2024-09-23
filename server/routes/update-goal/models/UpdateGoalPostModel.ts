/* eslint-disable max-classes-per-file */
import { Expose, plainToInstance, Transform } from 'class-transformer'

export class StepModel {
  description: string

  actor: string

  status: string
}

export default class UpdateGoalPostModel {
  @Expose()
  @Transform(({ obj }) => {
    return Object.keys(obj)
      .filter(key => key.startsWith('step-status-'))
      .map(key => key.split('step-status-')[1])
      .map(row => {
        return plainToInstance(StepModel, {
          key: `step-status-${row}`,
          status: obj[`step-status-${row}`],
        })
      })
  })
  steps: StepModel[]
}
