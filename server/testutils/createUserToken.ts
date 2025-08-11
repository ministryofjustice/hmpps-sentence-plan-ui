import jwt from 'jsonwebtoken'

export default function createUserToken(authorities: string[]) {
  const payload = {
    user_name: 'user1',
    user_uuid: 'a23ccacf-7160-4431-9b4d-c560be9c9f5c',
    name: 'Dr. Benjamin Runolfsdottir',
    scope: ['read', 'write'],
    auth_source: 'nomis',
    authorities,
    jti: 'a610a10-cca6-41db-985f-e87efb303aaf',
    client_id: 'clientid',
  }

  return jwt.sign(payload, 'secret', { expiresIn: '1h' })
}
