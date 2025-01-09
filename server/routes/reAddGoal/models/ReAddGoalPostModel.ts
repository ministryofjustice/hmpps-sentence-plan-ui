import { MaxLength } from 'class-validator'

export default class ReAddGoalPostModel {
  @MaxLength(4000)
  'goal-achievement-helped': string
}
