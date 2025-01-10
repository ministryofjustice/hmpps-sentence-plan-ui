import { IsNotEmpty, MaxLength, Validate, ValidateIf } from 'class-validator'
import { Expose, Transform } from 'class-transformer'
import GoalDateMustBeTodayOrFuture from '../../validators/GoalDateMustBeTodayOrFuture'

export default class CreateGoalPostModel {
  @IsNotEmpty({
    message: 'locale.goalSelection.errors.isEmpty',
  })
  @MaxLength(4000, {
    message: 'locale.goalSelection.errors.maxLength',
  })
  'goal-input-autocomplete': string

  @IsNotEmpty({
    message: 'locale.relatedAreaOfNeedRadio.errors.isEmpty',
  })
  'related-area-of-need-radio': string

  @ValidateIf(o => o['related-area-of-need-radio'] === 'yes')
  @IsNotEmpty({
    message: 'locale.relatedAreaOfNeed.errors.isNotEmpty',
  })
  @Transform(({ obj }) => {
    return typeof obj['related-area-of-need'] === 'string' ? [obj['related-area-of-need']] : obj['related-area-of-need']
  })
  'related-area-of-need': string[]

  @IsNotEmpty({
    message: 'locale.startWorking.errors.isEmpty',
  })
  'start-working-goal-radio': string

  @ValidateIf(o => o['start-working-goal-radio'] === 'yes')
  @IsNotEmpty({
    message: 'locale.dateSelection.errors.isEmpty',
  })
  'date-selection-radio': string

  @ValidateIf(o => o['date-selection-radio'] === 'custom' && o['start-working-goal-radio'] === 'yes')
  @IsNotEmpty({
    message: 'locale.datePicker.errors.isEmpty',
  })
  @Validate(GoalDateMustBeTodayOrFuture, {
    message: 'locale.datePicker.errors.goalDateMustBeTodayOrFuture',
  })
  @Expose()
  'date-selection-custom': string
}
