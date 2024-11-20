import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import { dateToISOFormat } from '../../utils/utils'

@ValidatorConstraint()
export default class GoalDateMustBeTodayOrFuture implements ValidatorConstraintInterface {
  validate(targetDate: string) {
    const today = new Date(new Date().toISOString().substring(0, 10))
    return new Date(dateToISOFormat(targetDate)) >= today
  }
}
