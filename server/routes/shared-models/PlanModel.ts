import { ArrayNotEmpty, IsDateString, IsEnum, Validate, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import GoalModel from './GoalModel'
import { PlanStatus } from '../../@types/PlanType'
import AtLeastOneCurrentGoal from './AtLeastOneCurrentGoal'

export default class PlanModel {
  uuid: string

  @IsEnum(PlanStatus)
  status: PlanStatus

  @IsDateString()
  createdDate: string

  @IsDateString()
  updatedDate: string

  @ArrayNotEmpty()
  @ValidateNested()
  @Validate(AtLeastOneCurrentGoal, { message: 'At least one goal must be current' })
  @Type(() => GoalModel)
  goals: GoalModel[]
}
