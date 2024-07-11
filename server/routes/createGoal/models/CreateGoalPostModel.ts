import { IsDate, IsNotEmpty, MinDate, ValidateIf } from 'class-validator'
import { Expose, Transform } from 'class-transformer'

export default class CreateGoalPostModel {
  @IsNotEmpty()
  'other-area-of-need-radio': string

  'date-selection-custom-day': string

  'date-selection-custom-month': string

  'date-selection-custom-year': string

  @ValidateIf(o => o['date-selection-radio'] === 'custom')
  @MinDate(new Date())
  @IsDate()
  @Expose()
  @Transform(({ obj }) => {
    const {
      'date-selection-custom-year': year,
      'date-selection-custom-month': month,
      'date-selection-custom-day': day,
    } = obj
    return year && month && day ? new Date(year, month - 1, day) : false
  })
  'date-selection-custom': Date
}
