/* eslint-disable max-classes-per-file */
import { Expose, plainToInstance, Transform } from 'class-transformer'
import { IsEnum, IsNotEmpty, Length, ValidateNested } from 'class-validator'
import { StepStatus } from '../../../@types/StepType'

export class StepModel {
  key: string

  @IsEnum(StepStatus)
  status: StepStatus

  @IsNotEmpty()
  @Length(36)
  uuid: string
}

export default class UpdateGoalPostModel {
  @Expose()
  @ValidateNested()
  @Transform(({ obj }) => {
    return Object.keys(obj)
      .filter(key => key.startsWith('step-status-'))
      .map(key => key.split('step-status-')[1])
      .map(row => {
        return plainToInstance(StepModel, {
          key: `step-status-${row}`,
          status: obj[`step-status-${row}`],
          uuid: obj[`step-uuid-${row}`],
        })
      })
  })
  steps: StepModel[]
}
