export const testPopData = {
  title: 'Doctor',
  firstName: 'Test',
  lastName: 'Data',
  gender: 'female',
  DoB: new Date('01/01/1997'),
  CRN: '12345678',
  PRC: 'ABC123XYZ',
  courtOrderRequirements: {},
}
export const getRoSHData = {
  overallRisk: 'VERY_HIGH',
  assessedOn: '2024-04-23T02:00:58',
  riskInCommunity: {
    Public: 'HIGH',
    Children: 'LOW',
    'Known Adult': 'MEDIUM',
    Staff: 'VERY_HIGH',
  },
  riskInCustody: {
    Public: 'HIGH',
    Children: 'LOW',
    'Known Adult': 'MEDIUM',
    Staff: 'VERY_HIGH',
    Prisoners: 'MEDIUM',
  },
}
export const parsedRoshData = {
  hasBeenCompleted: true,
  riskInCommunity: {
    Public: 'HIGH',
    Children: 'LOW',
    'Known Adult': 'MEDIUM',
    Staff: 'VERY_HIGH',
  },
  lastUpdated: '23 April 2024',
}
