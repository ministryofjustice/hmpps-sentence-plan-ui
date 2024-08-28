import { ArrayNotEmpty, IsDateString, IsEnum, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import GoalModel from './GoalModel'
import { PlanStatus } from '../../@types/PlanType'

export default class PlanModel {
  uuid: string

  @IsEnum(PlanStatus)
  status: PlanStatus

  @IsDateString()
  creationDate: string

  @IsDateString()
  updatedDate: string

  @ArrayNotEmpty()
  @ValidateNested()
  @Type(() => GoalModel)
  goals: GoalModel[]
}
