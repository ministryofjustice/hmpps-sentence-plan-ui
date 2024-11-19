import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import GoalModel from './GoalModel'

@ValidatorConstraint()
export default class AtLeastOneCurrentGoal implements ValidatorConstraintInterface {
  validate(goals: GoalModel[]) {
    return goals.some(goal => goal.targetDate !== null)
  }
}
