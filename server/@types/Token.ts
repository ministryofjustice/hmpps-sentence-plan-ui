import {JwtPayload} from "jwt-decode";

export type Token = {
  token: string
  expiresAt: number
}

type Scope = 'read' | 'write';

export interface JwtPayloadExtended extends JwtPayload  {
  user_name: string,
  auth_source: string,
  authorities: string[],
  client_id: string,
  user_uuid: string,
  grant_type: string,
  user_id: string,
  scope: Scope[],
  name: string,
}
