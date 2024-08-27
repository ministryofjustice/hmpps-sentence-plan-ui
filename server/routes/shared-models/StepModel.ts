import { ArrayNotEmpty, IsArray, IsDateString, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import ActorModel from './ActorModel'

export default class StepModel {
  uuid: string

  @IsString()
  @IsNotEmpty()
  description: string

  @IsString()
  @IsOptional()
  status: string

  @IsDateString()
  creationDate: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActorModel)
  @ArrayNotEmpty()
  actors: ActorModel[]
}
