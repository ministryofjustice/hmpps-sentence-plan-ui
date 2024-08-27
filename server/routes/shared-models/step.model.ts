import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import Actor from './actor.model'

export default class Step {
  @IsUUID()
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
  @Type(() => Actor)
  @ArrayNotEmpty()
  actors: Actor[]
}
