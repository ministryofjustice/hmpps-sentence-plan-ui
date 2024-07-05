import { Router } from 'express'
import { Services } from '../../services'

export default function setupReferenceDataRoutes(router: Router, { referentialDataService }: Services) {
  router.get('/reference-data/areaOfNeed/:areaOfNeed/steps', (req, res, next) => {
    const { areaOfNeed } = req.params
    res.json(referentialDataService.getSteps(areaOfNeed))
  })
  router.get('/reference-data/areaOfNeed/:areaOfNeed/goals', (req, res, next) => {
    const { areaOfNeed } = req.params
    res.json(referentialDataService.getGoals(areaOfNeed))
  })
  router.get('/reference-data/areaOfNeed', (req, res, next) => {
    res.json(referentialDataService.getAreasOfNeed())
  })
}
