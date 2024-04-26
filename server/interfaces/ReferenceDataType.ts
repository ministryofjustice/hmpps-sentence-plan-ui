export type ReferenceData = {
  AreasOfNeed: [
    {
      id: number
      Name: string
      Goals: [
        {
          id: number
          Name: string
          Steps: [id: number, name: string]
        },
      ]
    },
  ]
}
