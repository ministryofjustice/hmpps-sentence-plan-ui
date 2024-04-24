import { IsInt, IsNotEmpty, ValidateIf } from 'class-validator'

export default class ConfirmGoalPostModel {
  @IsNotEmpty()
  'goal-agreement': boolean

  @ValidateIf(o => o['goal-agreement'] === 'false')
  @IsNotEmpty()
  'goal-agreement-note': string
}
