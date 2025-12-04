const testPopData = {
  firstName: 'Buster',
  lastName: 'Sanford',
  gender: 1,
  doB: '2002-01-15',
  crn: 'X336018',
  prc: '01/14106572A',
  courtOrderRequirements: {},
  sentences: [
    {
      description: 'Custodial Sentence',
      startDate: '2024-11-06',
      endDate: '2029-01-12',
      programmeRequirement: false,
      unpaidWorkHoursOrdered: 10,
      unpaidWorkMinutesCompleted: 20,
      rarDaysOrdered: 3,
      rarDaysCompleted: 1,
      rarRequirement: true,
    },
    {
      description: 'ORA Community Order',
      startDate: '2024-11-19',
      endDate: '2025-05-18',
      programmeRequirement: false,
      unpaidWorkHoursOrdered: 0,
      unpaidWorkMinutesCompleted: 0,
      rarDaysOrdered: 0,
      rarDaysCompleted: 0,
      rarRequirement: false,
    },
  ],
}

export default testPopData
