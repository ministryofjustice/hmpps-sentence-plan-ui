import { IsInt, IsNotEmpty, ValidateIf } from 'class-validator'

export default class CreateGoalPostModel {
  @IsNotEmpty()
  'goal-selection-radio': string

  @ValidateIf(o => o['goal-selection-radio'] === 'custom')
  @IsNotEmpty()
  'goal-selection-custom': string

  @IsNotEmpty()
  'date-selection-radio': string

  @ValidateIf(o => o['date-selection-radio'] === 'custom')
  @IsNotEmpty()
  @IsInt()
  'date-selection-custom-day': string

  @ValidateIf(o => o['date-selection-radio'] === 'custom')
  @IsNotEmpty()
  @IsInt()
  'date-selection-custom-month': string

  @ValidateIf(o => o['date-selection-radio'] === 'custom')
  @IsNotEmpty()
  @IsInt()
  'date-selection-custom-year': string
}
