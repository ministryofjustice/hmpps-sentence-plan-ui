import { IsNotEmpty, ValidateIf } from 'class-validator'
import { Expose, Transform } from 'class-transformer'

export default class CreateGoalPostModel {
  @IsNotEmpty()
  'input-autocomplete': string

  @IsNotEmpty()
  'other-area-of-need-radio': string

  @ValidateIf(o => o['other-area-of-need-radio'] === 'yes')
  @IsNotEmpty()
  @Transform(({ obj }) => {
    return typeof obj['other-area-of-need'] === 'string' ? [obj['other-area-of-need']] : obj['other-area-of-need']
  })
  'other-area-of-need': string[]

  @IsNotEmpty()
  'start-working-goal-radio': string

  @ValidateIf(o => o['start-working-goal-radio'] === 'yes')
  @IsNotEmpty()
  'date-selection-radio': string

  @ValidateIf(o => o['date-selection-radio'] === 'custom' && o['start-working-goal-radio'] === 'yes')
  @IsNotEmpty()
  @Expose()
  'date-selection-custom': Date
}
