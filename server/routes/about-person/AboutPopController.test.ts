import mockRes from '../../testutils/preMadeMocks/mockRes'
import mockReq from '../../testutils/preMadeMocks/mockReq'
import AboutPersonController from './AboutPersonController'
import locale from './locale.json'
import { AreaOfNeed } from '../../testutils/data/referenceData'
import testPlan from '../../testutils/data/planData'
import popData from '../../testutils/data/popData'
import testHandoverContext from '../../testutils/data/handoverData'
import { assessmentData, crimNeeds } from '../../testutils/data/assessmentData'
import { AssessmentAreas } from '../../@types/Assessment'
import { formatAssessmentData } from '../../utils/utils'

const oasysReturnUrl = 'https://oasys.return.url'

jest.mock('../../services/sentence-plan/assessmentService', () => {
  return jest.fn().mockImplementation(() => ({
    getAssessmentByUuid: jest.fn().mockReturnValue(assessmentData),
  }))
})

jest.mock('../../services/sentence-plan/referentialDataService', () => {
  return jest.fn().mockImplementation(() => ({
    getAreasOfNeed: jest.fn().mockReturnValue(AreaOfNeed),
  }))
})

jest.mock('../../services/sessionService', () => {
  return jest.fn().mockImplementation(() => ({
    getPlanUUID: jest.fn().mockReturnValue(testPlan.uuid),
    getOasysReturnUrl: jest.fn().mockReturnValue(oasysReturnUrl),
    getPrincipalDetails: jest.fn().mockReturnValue(testHandoverContext.principal),
    getSubjectDetails: jest.fn().mockReturnValue(testHandoverContext.subject),
    getCriminogenicNeeds: jest.fn().mockReturnValue(crimNeeds),
  }))
})

jest.mock('../../services/sentence-plan/infoService', () => {
  return jest.fn().mockImplementation(() => ({
    getPopData: jest.fn().mockReturnValue(popData),
  }))
})

describe('AboutPopController', () => {
  let controller: AboutPersonController
  const assessmentAreas: AssessmentAreas = formatAssessmentData(crimNeeds, assessmentData, locale.en.areas)

  beforeEach(() => {
    controller = new AboutPersonController()
  })

  describe('get', () => {
    it('should render when no exceptions thrown', async () => {
      const req = mockReq()
      const res = mockRes()
      const next = jest.fn()
      await controller.get(req, res, next)

      const payload = {
        locale: locale.en,
        data: {
          oasysReturnUrl,
          pageId: 'about',
          deliusData: popData,
          assessmentAreas,
        },
        errors: {},
      }
      expect(res.render).toHaveBeenCalledWith('pages/about', payload)
    })
  })
})
