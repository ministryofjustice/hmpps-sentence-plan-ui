import { ArrayNotEmpty, IsDateString, IsEnum, Validate, ValidateIf, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import GoalModel from './GoalModel'
import { PlanAgreementStatus, PlanStatus } from '../../@types/PlanType'
import AtLeastOneCurrentGoal from '../validators/AtLeastOneCurrentGoal'

export default class AgreedPlanModel {
  @ValidateIf(o => o.agreementStatus !== PlanAgreementStatus.DRAFT)
  @ArrayNotEmpty()
  @ValidateNested()
  @Type(() => GoalModel)
  goals: GoalModel[]
}
