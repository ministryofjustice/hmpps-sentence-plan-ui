export interface RoshDetail {
  Public: string
  Children: string
  'Known Adult': string
  Staff: string
  Prisoners?: string
}
export interface RoshData {
  overallRisk?: string
  assessedOn: string
  riskInCommunity: RoshDetail
  riskInCustody: RoshDetail
  lastUpdated?: string
}
