import { IsIn, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator'

export default class AgreePlanPost {
  @IsString()
  @IsNotEmpty()
  planUuid: string

  @IsIn(['yes', 'no', 'couldNotAnswer'])
  'agree-plan-radio': string

  @IsNotEmpty()
  @ValidateIf((obj: AgreePlanPost) => obj['agree-plan-radio'] === 'no')
  'does-not-agree-details': string

  @IsNotEmpty()
  @ValidateIf((obj: AgreePlanPost) => obj['agree-plan-radio'] === 'couldNotAnswer')
  'could-not-answer-details': string

  @IsString()
  @IsOptional()
  notes?: string
}
