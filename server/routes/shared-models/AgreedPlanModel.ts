import { ArrayNotEmpty, ValidateIf, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import GoalModel from './GoalModel'
import { PlanAgreementStatus } from '../../@types/PlanType'

export default class AgreedPlanModel {
  @ValidateIf(o => o.agreementStatus !== PlanAgreementStatus.DRAFT)
  @ArrayNotEmpty()
  @ValidateNested()
  @Type(() => GoalModel)
  goals: GoalModel[]
}
