import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator'

export default class ActorModel {
  @IsString()
  @IsNotEmpty()
  actor: string

  @IsInt()
  @Min(1)
  actorOptionId: number
}
