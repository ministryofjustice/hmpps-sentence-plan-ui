import { ArrayNotEmpty, IsArray, IsDateString, IsEnum, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import GoalModel from './GoalModel'

export default class PlanModel {
  uuid: string

  @IsEnum({
    INCOMPLETE: 'INCOMPLETE',
    COMPLETE: 'COMPLETE',
    IN_PROGRESS: 'IN_PROGRESS',
  })
  status: string

  @IsDateString()
  creationDate: string

  @IsDateString()
  updatedDate: string

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested()
  @Type(() => GoalModel)
  goals: GoalModel[]
}
