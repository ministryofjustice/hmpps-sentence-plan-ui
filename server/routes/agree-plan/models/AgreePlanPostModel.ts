import { IsIn, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator'

export default class AgreePlanPostModel {
  @IsIn(['yes', 'no', 'couldNotAnswer'])
  'agree-plan-radio': string

  @IsNotEmpty()
  @ValidateIf((obj: AgreePlanPostModel) => obj['agree-plan-radio'] === 'no')
  'does-not-agree-details': string

  @IsNotEmpty()
  @ValidateIf((obj: AgreePlanPostModel) => obj['agree-plan-radio'] === 'couldNotAnswer')
  'could-not-answer-details': string

  @IsString()
  @IsOptional()
  notes?: string
}
