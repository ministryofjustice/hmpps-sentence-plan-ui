import { MaxLength } from 'class-validator'

export default class AchieveGoalPostModel {
  @MaxLength(1500)
  'goal-achievement-helped': string
}
