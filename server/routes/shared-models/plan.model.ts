import { IsArray, IsDateString, IsEnum, IsUUID, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import Goal from './goal.model'

export default class Plan {
  @IsUUID()
  uuid: string

  @IsEnum({
    INCOMPLETE: 'INCOMPLETE',
    COMPLETE: 'COMPLETE',
    IN_PROGRESS: 'IN_PROGRESS',
  })
  status: string

  @IsDateString()
  creationDate: string

  @IsDateString()
  updatedDate: string

  @IsArray()
  @ValidateNested()
  @Type(() => Goal)
  goals: Goal[]
}
