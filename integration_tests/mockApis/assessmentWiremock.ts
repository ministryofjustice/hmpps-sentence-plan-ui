import superagent, { type Response } from 'superagent'
import config from '../../server/config'

const url = `${config.apis.coordinatorApi.url}/__admin`

export const resetStubs = (): Promise<Response> => superagent.post(`${url}/mappings/reset`)

export async function findMappingIdByUrlPattern(urlPattern: string): Promise<string | null> {
  try {
    const response = await superagent.get(`${url}/mappings`)
    const { mappings } = response.body

    for (const mapping of mappings) {
      if (mapping.request.urlPattern === urlPattern) {
        return mapping.id
      }
    }

    return null
  } catch {
    return null
  }
}

export async function deleteMappingByUrlPattern(pattern: string): Promise<void> {
  try {
    const mappingId = await findMappingIdByUrlPattern(pattern)
    if (mappingId) {
      await superagent.delete(`${url}/mappings/${mappingId}`)
    }
  } catch {
    return null
  }
  return null
}
