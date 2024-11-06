import { IsNotEmpty, MaxLength } from 'class-validator'

export default class RemoveGoalPostModel {
  @IsNotEmpty()
  @MaxLength(4000)
  'goal-removal-note'?: string
}
