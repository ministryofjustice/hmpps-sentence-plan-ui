import { IsNotEmpty } from 'class-validator'

export default class PrivacyScreenPostModel {
  @IsNotEmpty()
  'confirm-privacy-checkbox': string
}
