import mockRes from '../../testutils/preMadeMocks/mockRes'
import mockReq from '../../testutils/preMadeMocks/mockReq'
import AboutPersonController from './AboutPersonController'
import locale from './locale.json'
import { areaConfigs } from './assessmentAreaConfig.json'
import { AreaOfNeed } from '../../testutils/data/referenceData'
import testPlan from '../../testutils/data/planData'
import popData from '../../testutils/data/popData'
import testHandoverContext from '../../testutils/data/handoverData'
import { assessmentData, crimNeedsMissing, crimNeedsSubset } from '../../testutils/data/assessmentData'
import { AssessmentAreas } from '../../@types/Assessment'

import { formatAssessmentData } from '../../utils/assessmentUtils'
import { AccessMode } from '../../@types/Handover'

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
    getCriminogenicNeeds: jest.fn().mockReturnValue(crimNeedsSubset),
    getAccessMode: jest.fn().mockReturnValue(AccessMode.READ_WRITE),
  }))
})

jest.mock('../../services/sentence-plan/infoService', () => {
  return jest.fn().mockImplementation(() => ({
    getPopData: jest.fn().mockReturnValue(popData),
  }))
})

describe('AboutPersonController - assessment complete', () => {
  let controller: AboutPersonController
  const assessmentAreas: AssessmentAreas = formatAssessmentData(crimNeedsSubset, assessmentData, areaConfigs)

  beforeEach(() => {
    controller = new AboutPersonController()
  })

  describe('Get About Person READ_WRITE', () => {
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
          readWrite: true,
        },
        errors: {},
      }

      expect(res.render).toHaveBeenCalledWith('pages/about', payload)
    })
  })

  describe('Get About Person READ_ONLY', () => {
    it('should render when no exceptions thrown', async () => {
      const req = mockReq()
      const res = mockRes()
      const next = jest.fn()

      req.services.sessionService.getAccessMode = jest.fn().mockReturnValue(AccessMode.READ_ONLY)

      await controller.get(req, res, next)

      const payload = {
        locale: locale.en,
        data: {
          oasysReturnUrl,
          pageId: 'about',
          deliusData: popData,
          assessmentAreas,
          readWrite: false,
        },
        errors: {},
      }

      expect(res.render).toHaveBeenCalledWith('pages/about', payload)
    })
  })
})

describe('AboutPersonController - assessment incomplete', () => {
  let controller: AboutPersonController
  const assessmentAreas: AssessmentAreas = formatAssessmentData(crimNeedsMissing, assessmentData, areaConfigs)

  beforeEach(() => {
    controller = new AboutPersonController()
  })

  describe('Get About Person READ_WRITE', () => {
    it('should render when no exceptions thrown', async () => {
      const req = mockReq()
      const res = mockRes()

      req.services.sessionService.getCriminogenicNeeds = jest.fn().mockReturnValue(crimNeedsMissing)

      const next = jest.fn()
      await controller.get(req, res, next)

      const payload = {
        locale: locale.en,
        data: {
          oasysReturnUrl,
          pageId: 'about',
          deliusData: popData,
          assessmentAreas,
          readWrite: true,
        },
        errors: {},
      }

      expect(res.render).toHaveBeenCalledWith('pages/about-not-complete', payload)
    })
  })

  describe('Get About Person READ_ONLY', () => {
    it('should render when no exceptions thrown', async () => {
      const req = mockReq()
      const res = mockRes()

      req.services.sessionService.getCriminogenicNeeds = jest.fn().mockReturnValue(crimNeedsMissing)
      req.services.sessionService.getAccessMode = jest.fn().mockReturnValue(AccessMode.READ_ONLY)

      const next = jest.fn()

      await controller.get(req, res, next)

      const payload = {
        locale: locale.en,
        data: {
          oasysReturnUrl,
          pageId: 'about',
          deliusData: popData,
          assessmentAreas,
          readWrite: false,
        },
        errors: {},
      }

      expect(res.render).toHaveBeenCalledWith('pages/about-not-complete', payload)
    })
  })
})
