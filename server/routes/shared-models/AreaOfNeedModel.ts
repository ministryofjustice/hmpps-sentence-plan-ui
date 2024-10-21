import { IsNotEmpty, IsString } from 'class-validator'

export default class AreaOfNeedModel {
  uuid: string

  @IsString()
  @IsNotEmpty()
  name: string
}
