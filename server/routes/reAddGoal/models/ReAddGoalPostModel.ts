import { IsNotEmpty, MaxLength, Validate, ValidateIf } from 'class-validator'
import { Expose } from 'class-transformer'
import GoalDateMustBeTodayOrFuture from '../../validators/GoalDateMustBeTodayOrFuture'

export default class ReAddGoalPostModel {
  @IsNotEmpty()
  @MaxLength(4000)
  're-add-goal-reason': string

  @IsNotEmpty()
  'start-working-goal-radio': string

  @ValidateIf(o => o['start-working-goal-radio'] === 'yes')
  @IsNotEmpty()
  'date-selection-radio': string

  @ValidateIf(o => o['date-selection-radio'] === 'custom' && o['start-working-goal-radio'] === 'yes')
  @IsNotEmpty()
  @Validate(GoalDateMustBeTodayOrFuture, { message: 'Date must be today or in the future' })
  @Expose()
  'date-selection-custom': string
}
