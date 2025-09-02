type EntityType = 'ASSESSMENT' | 'PLAN'

type VersionDetails = {
  uuid: string
  version: number
  createdAt: string
  updatedAt: string
  status: string
  entityType: EntityType
}

interface LastVersionsOnDate {
  description: string
  assessmentVersion: VersionDetails
  planVersion: VersionDetails
}

type VersionsTable = Record<string, LastVersionsOnDate>

export interface PreviousVersionsResponse {
  allVersions: VersionsTable
  countersignedVersions: VersionsTable
}
