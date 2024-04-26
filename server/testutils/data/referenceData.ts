const testReferenceData = {
  AreasOfNeed: [
    {
      id: 1,
      Name: 'Test Area Of Need 1',
      active: true,
      Goals: [
        {
          id: 1,
          Name: 'Test Goal 1',
          Active: true,
          Steps: [
            {
              id: 1,
              Name: 'Test Goal 1 - Step A',
              Active: true,
            },
            {
              id: 2,
              Name: 'Test Goal 1 - Step B',
              Active: true,
            },
          ],
        },
        {
          id: 2,
          Name: 'Test Goal 2',
          Active: true,
          Steps: [
            {
              id: 3,
              Name: 'Test Goal 2 - Step A',
              Active: true,
            },
          ],
        },
      ],
    },
    {
      id: 1,
      Name: 'Test Area Of Need 2',
      active: true,
      Goals: [
        {
          id: 3,
          Name: 'Test Goal 3',
          Active: true,
          Steps: [
            {
              id: 4,
              Name: 'Test Goal 3 - Step A',
              Active: true,
            },
          ],
        },
        {
          id: 4,
          Name: 'Test Goal 4',
          Active: true,
          Steps: [
            {
              id: 5,
              Name: 'Test Goal 4 - Step A',
              Active: true,
            },
            {
              id: 6,
              Name: 'Test Goal 4 - Step B',
              Active: true,
            },
          ],
        },
      ],
    },
  ],
}

export default testReferenceData
