import mockRes from '../../testutils/preMadeMocks/mockRes'
import mockReq from '../../testutils/preMadeMocks/mockReq'
import AboutPersonController from './AboutPersonController'
import locale from './locale.json'
import { areaConfigs } from '../../utils/assessmentAreaConfig.json'
import { AreaOfNeed } from '../../testutils/data/referenceData'
import testPlan from '../../testutils/data/planData'
import popData from '../../testutils/data/popData'
import testHandoverContext from '../../testutils/data/handoverData'
import {
  completeAssessmentData,
  fullCrimNeeds,
  incompleteAssessmentData,
} from '../../testutils/data/testAssessmentData'
import { FormattedAssessment } from '../../@types/Assessment'

import { formatAssessmentData } from '../../utils/assessmentUtils'
import { AccessMode } from '../../@types/Handover'

const oasysReturnUrl = 'https://oasys.return.url'

jest.mock('../../services/sentence-plan/referentialDataService', () => {
  return jest.fn().mockImplementation(() => ({
    getAreasOfNeed: jest.fn().mockReturnValue(AreaOfNeed),
  }))
})

jest.mock('../../services/sentence-plan/planService', () => {
  return jest.fn().mockImplementation(() => ({
    getPlanByUuid: jest.fn().mockResolvedValue(testPlan),
  }))
})

jest.mock('../../services/sessionService', () => {
  return jest.fn().mockImplementation(() => ({
    getPlanUUID: jest.fn().mockReturnValue(testPlan.uuid),
    getOasysReturnUrl: jest.fn().mockReturnValue(oasysReturnUrl),
    getPrincipalDetails: jest.fn().mockReturnValue(testHandoverContext.principal),
    getSubjectDetails: jest.fn().mockReturnValue(testHandoverContext.subject),
    getCriminogenicNeeds: jest.fn().mockReturnValue(fullCrimNeeds),
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
  let assessmentAreas: FormattedAssessment
  const req = mockReq()
  const res = mockRes()

  beforeEach(() => {
    controller = new AboutPersonController()
    req.services.assessmentService.getAssessmentByUuid = jest.fn().mockReturnValue(completeAssessmentData)
    assessmentAreas = formatAssessmentData(fullCrimNeeds, completeAssessmentData, areaConfigs)
  })

  describe('Get About Person READ_WRITE', () => {
    it('should render when no exceptions thrown', async () => {
      const next = jest.fn()
      await controller.get(req, res, next)

      const payload = {
        locale: locale.en,
        data: {
          planAgreementStatus: testPlan.agreementStatus,
          oasysReturnUrl,
          pageId: 'about',
          deliusData: popData,
          formattedAssessmentInfo: assessmentAreas,
          readWrite: true,
        },
        errors: {},
      }

      expect(res.render).toHaveBeenCalledWith('pages/about', payload)
    })
  })

  describe('Get About Person READ_ONLY', () => {
    it('should render when no exceptions thrown', async () => {
      const next = jest.fn()

      req.services.sessionService.getAccessMode = jest.fn().mockReturnValue(AccessMode.READ_ONLY)

      await controller.get(req, res, next)

      const payload = {
        locale: locale.en,
        data: {
          planAgreementStatus: testPlan.agreementStatus,
          oasysReturnUrl,
          pageId: 'about',
          deliusData: popData,
          formattedAssessmentInfo: assessmentAreas,
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
  const req = mockReq()
  const res = mockRes()
  let assessmentAreas: FormattedAssessment

  beforeEach(() => {
    controller = new AboutPersonController()
    req.services.assessmentService.getAssessmentByUuid = jest.fn().mockReturnValue(incompleteAssessmentData)
    assessmentAreas = formatAssessmentData(fullCrimNeeds, incompleteAssessmentData, areaConfigs)
  })

  describe('Get About Person READ_WRITE', () => {
    it('should render when no exceptions thrown', async () => {
      req.services.sessionService.getCriminogenicNeeds = jest.fn().mockReturnValue(fullCrimNeeds)

      const next = jest.fn()
      await controller.get(req, res, next)

      const expectedPayload = {
        locale: locale.en,
        data: {
          planAgreementStatus: testPlan.agreementStatus,
          oasysReturnUrl,
          pageId: 'about',
          deliusData: popData,
          formattedAssessmentInfo: assessmentAreas,
          readWrite: true,
        },
        errors: {},
      }

      expect(res.render).toHaveBeenCalledWith('pages/about', expectedPayload)
    })
  })

  describe('Get About Person READ_ONLY', () => {
    it('should render when no exceptions thrown', async () => {
      req.services.sessionService.getCriminogenicNeeds = jest.fn().mockReturnValue(fullCrimNeeds)
      req.services.sessionService.getAccessMode = jest.fn().mockReturnValue(AccessMode.READ_ONLY)

      const next = jest.fn()

      await controller.get(req, res, next)

      const expectedPayload = {
        locale: locale.en,
        data: {
          planAgreementStatus: testPlan.agreementStatus,
          oasysReturnUrl,
          pageId: 'about',
          deliusData: popData,
          formattedAssessmentInfo: assessmentAreas,
          readWrite: false,
        },
        errors: {},
      }

      expect(res.render).toHaveBeenCalledWith('pages/about', expectedPayload)
    })
  })
})
