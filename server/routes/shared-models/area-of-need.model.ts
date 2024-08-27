import { IsNotEmpty, IsString, IsUUID } from 'class-validator'

export default class AreaOfNeed {
  @IsUUID()
  uuid: string

  @IsString()
  @IsNotEmpty()
  name: string
}
