import { IsNotEmpty } from 'class-validator'

export default class RemoveGoalPostModel {
  @IsNotEmpty()
  'goal-removal-note'?: string
}
