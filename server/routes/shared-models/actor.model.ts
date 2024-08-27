import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator'

export default class Actor {
  @IsString()
  @IsNotEmpty()
  actor: string

  @IsInt()
  @Min(1)
  actorOptionId: number
}
