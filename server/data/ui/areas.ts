export interface Areas {
  id: number
  name: string
  active: boolean
  url: string
}
export const areasData: Array<Areas> = [
  {
    id: 1,
    name: 'Accomodation',
    active: true,
    url: 'accommodation',
  },
  {
    id: 2,
    name: 'Drugs',
    active: true,
    url: 'drugs',
  },
  {
    id: 3,
    name: 'Health and Wellbeing',
    active: true,
    url: 'health-and-wellbeing',
  },
]
