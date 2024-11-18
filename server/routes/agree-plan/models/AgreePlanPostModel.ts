import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator'

export default class AgreePlanPostModel {
  @IsIn(['yes', 'no', 'couldNotAnswer'])
  'agree-plan-radio': string

  @IsNotEmpty()
  @MaxLength(1500)
  @ValidateIf((obj: AgreePlanPostModel) => obj['agree-plan-radio'] === 'no')
  'does-not-agree-details': string

  @IsNotEmpty()
  @MaxLength(1500)
  @ValidateIf((obj: AgreePlanPostModel) => obj['agree-plan-radio'] === 'couldNotAnswer')
  'could-not-answer-details': string

  @IsString()
  @IsOptional()
  @MaxLength(1500)
  notes?: string
}
