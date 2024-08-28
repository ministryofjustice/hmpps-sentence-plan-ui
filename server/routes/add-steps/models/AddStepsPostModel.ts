/* eslint-disable max-classes-per-file */
import { IsNotEmpty, ValidateNested } from 'class-validator'
import { Expose, plainToInstance, Transform } from 'class-transformer'

export class StepModel {
  @IsNotEmpty()
  actor: string

  @IsNotEmpty()
  description: string
}

export default class AddStepsPostModel {
  @Expose()
  @ValidateNested()
  @Transform(({ obj }) => {
    return Object.keys(obj)
      .filter(key => key.startsWith('step-actor-'))
      .map(key => key.split('step-actor-')[1])
      .map(row => {
        return plainToInstance(StepModel, {
          actor: obj[`step-actor-${row}`],
          description: obj[`step-description-${row}`],
        })
      })
  })
  steps: StepModel[]
}
