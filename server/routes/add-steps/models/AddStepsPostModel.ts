/* eslint-disable max-classes-per-file */
import { IsEnum, IsNotEmpty, ValidateNested } from 'class-validator'
import { Expose, plainToInstance, Transform } from 'class-transformer'
import { StepStatus } from '../../../@types/StepType'

export class StepModel {
  @IsNotEmpty()
  actor: string

  @IsNotEmpty()
  description: string

  @IsEnum(StepStatus)
  status: string
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
          status: obj[`step-status-${row}`],
        })
      })
  })
  steps: StepModel[]
}
