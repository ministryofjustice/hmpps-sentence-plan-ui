/* eslint-disable max-classes-per-file */
import { IsEnum, IsNotEmpty, MaxLength, NotContains, ValidateNested } from 'class-validator'
import { Expose, plainToInstance, Transform } from 'class-transformer'
import { StepStatus } from '../../../@types/StepType'

export class StepModel {
  @IsNotEmpty({
    message: 'locale.step.actor.errors.isEmpty',
  })
  @NotContains('Choose someone', {
    message: 'locale.step.actor.errors.isEmpty',
  })
  actor: string

  @IsNotEmpty({
    message: 'locale.step.description.errors.isEmpty',
  })
  @MaxLength(4000, {
    message: 'locale.step.description.errors.maxLength',
  })
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
