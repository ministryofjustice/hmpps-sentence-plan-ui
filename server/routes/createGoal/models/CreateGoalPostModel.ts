import { IsNotEmpty, MaxLength, ValidateIf } from 'class-validator'
import { Expose, Transform } from 'class-transformer'

export default class CreateGoalPostModel {
  @IsNotEmpty()
  @MaxLength(1500)
  'goal-input-autocomplete': string

  @IsNotEmpty()
  'related-area-of-need-radio': string

  @ValidateIf(o => o['related-area-of-need-radio'] === 'yes')
  @IsNotEmpty()
  @Transform(({ obj }) => {
    return typeof obj['related-area-of-need'] === 'string' ? [obj['related-area-of-need']] : obj['related-area-of-need']
  })
  'related-area-of-need': string[]

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
