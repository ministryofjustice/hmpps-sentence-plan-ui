import { IsNotEmpty, MaxLength } from 'class-validator'

export default class RemoveGoalPostModel {
  @IsNotEmpty()
  @MaxLength(1500)
  'goal-removal-note'?: string
}
