import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import AreaOfNeed from './area-of-need.model'
import Step from './step.model'

export default class Goal {
  @IsUUID()
  uuid: string

  @IsString()
  @IsNotEmpty()
  title: string

  @ValidateNested()
  @Type(() => AreaOfNeed)
  areaOfNeed: AreaOfNeed

  targetDate: string

  @IsDateString()
  creationDate: string

  @IsInt()
  @Min(0)
  goalOrder: number

  @ValidateIf(o => o.targetDate != null)
  @IsArray()
  @ValidateNested()
  @Type(() => Step)
  @ArrayNotEmpty()
  steps: Step[]

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AreaOfNeed)
  relatedAreasOfNeed: AreaOfNeed[]
}
