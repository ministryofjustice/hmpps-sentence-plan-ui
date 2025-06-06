import { IsIn, IsNotEmpty, MaxLength, ValidateIf } from 'class-validator'

export default class UpdateAgreePlanPostModel {
  @IsIn(['yes', 'no'])
  'agree-plan-radio': string

  @IsNotEmpty()
  @MaxLength(4000)
  @ValidateIf((obj: UpdateAgreePlanPostModel) => obj['agree-plan-radio'] === 'no')
  'does-not-agree-details': string
}
