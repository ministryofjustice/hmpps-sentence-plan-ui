import { IsDateString, IsEnum, IsNotEmpty, IsString } from 'class-validator'
import { StepStatus } from '../../@types/StepType'

export default class StepModel {
  uuid: string

  @IsString()
  @IsNotEmpty()
  description: string

  @IsEnum(StepStatus)
  status: StepStatus

  @IsDateString()
  createdDate: string

  actor: string
}
