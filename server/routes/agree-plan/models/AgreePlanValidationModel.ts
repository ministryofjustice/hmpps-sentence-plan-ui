import { ArrayNotEmpty, IsNotEmpty, Validate, ValidateIf } from 'class-validator'
import { GoalReadinessValidator } from './GoalReadinessValidator'

export default class AgreePlanValidationModel {
  @Validate(GoalReadinessValidator)
  'now': []
}
