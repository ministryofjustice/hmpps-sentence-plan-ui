import { IsNotEmpty, ValidateIf } from 'class-validator'

export default class AgreePlanPostModel {
  @IsNotEmpty()
  'agree-plan-radio': string

  @ValidateIf(o => o['agree-plan-radio'] === 'no')
  @IsNotEmpty()
  'does-not-agree-details': string

  @ValidateIf(o => o['agree-plan-radio'] === 'couldNotAnswer')
  @IsNotEmpty()
  'could-not-answer-details': string
}
