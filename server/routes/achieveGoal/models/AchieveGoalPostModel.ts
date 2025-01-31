import { IsNotEmpty, MaxLength } from 'class-validator'

export default class AchieveGoalPostModel {
  @MaxLength(4000)
  'goal-achievement-helped': string

  @IsNotEmpty()
  'is-goal-achieved-radio': string
}
