import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator'
import { Goal } from '../../../@types/GoalType'

@ValidatorConstraint({ name: 'goalReadiness', async: false })
// eslint-disable-next-line import/prefer-default-export
export class GoalReadinessValidator implements ValidatorConstraintInterface {
  validate(currentGoals: Goal[], args: ValidationArguments) {
    if (!currentGoals.length) return false

    if (currentGoals.filter(goal => goal.steps.length === 0).length) return false

    return true
  }

  defaultMessage(args: ValidationArguments) {
    return 'You must add steps to the goals being worked on now' // TODO not the correct error message. Should be "You must add steps to the goals subject.givenName is working on now"
  }
}
