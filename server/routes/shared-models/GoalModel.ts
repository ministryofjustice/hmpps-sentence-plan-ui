import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import AreaOfNeedModel from './AreaOfNeedModel'
import StepModel from './StepModel'

export default class GoalModel {
  uuid: string

  @IsString()
  @IsNotEmpty()
  title: string

  @ValidateNested()
  @Type(() => AreaOfNeedModel)
  areaOfNeed: AreaOfNeedModel

  targetDate: string

  @IsDateString()
  creationDate: string

  @IsInt()
  @Min(0)
  goalOrder: number

  @ValidateIf(o => o.targetDate != null)
  @ValidateNested()
  @Type(() => StepModel)
  @ArrayNotEmpty()
  steps: StepModel[]

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AreaOfNeedModel)
  relatedAreasOfNeed: AreaOfNeedModel[]
}
