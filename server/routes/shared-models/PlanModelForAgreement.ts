import { ArrayNotEmpty, IsDateString, IsEnum, Validate, ValidateIf, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import GoalModel from './GoalModel'
import { PlanAgreementStatus, PlanStatus } from '../../@types/PlanType'
import AtLeastOneCurrentGoal from '../validators/AtLeastOneCurrentGoal'

export default class PlanModelForAgreement {
  uuid: string

  @IsEnum(PlanStatus)
  status: PlanStatus

  @IsEnum(PlanAgreementStatus)
  agreementStatus: PlanAgreementStatus

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
