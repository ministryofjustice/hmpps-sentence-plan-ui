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
import { AuditEvent } from '../../services/auditService'
import { AccessMode } from '../../@types/SessionType'

const systemReturnUrl = 'https://oasys.return.url'

jest.mock('../../services/auditService')

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
    getSystemReturnUrl: jest.fn().mockReturnValue(systemReturnUrl),
    getPrincipalDetails: jest.fn().mockReturnValue(testHandoverContext.principal),
    getSubjectDetails: jest.fn().mockReturnValue(testHandoverContext.subject),
    getCriminogenicNeeds: jest.fn().mockReturnValue(fullCrimNeeds),
    getAccessMode: jest.fn().mockReturnValue(AccessMode.READ_WRITE),
    setReturnLink: jest.fn(),
  }))
})

jest.mock('../../services/sentence-plan/infoService', () => {
  return jest.fn().mockImplementation(() => ({
    getPopData: jest.fn().mockResolvedValue(popData),
  }))
})

jest.mock('../../services/sentence-plan/assessmentService', () => {
  return jest.fn().mockImplementation(() => ({
    getAssessmentByUuid: jest.fn().mockResolvedValue(completeAssessmentData),
  }))
})

describe('AboutPersonController - API data error handling', () => {
  let controller: AboutPersonController
  const req = mockReq()
  const res = mockRes()
  const next = jest.fn()
  let assessmentAreas: FormattedAssessment

  beforeEach(() => {
    jest.clearAllMocks()

    controller = new AboutPersonController()
    assessmentAreas = formatAssessmentData(fullCrimNeeds, completeAssessmentData, areaConfigs)

    req.services.assessmentService.getAssessmentByUuid = jest.fn().mockResolvedValue(completeAssessmentData)
    req.services.infoService.getPopData = jest.fn().mockResolvedValue(popData)
  })

  it('should have a delius error if delius API call fails', async () => {
    req.services.infoService.getPopData = jest.fn().mockRejectedValue(new Error('API error'))

    await controller.get(req, res, next)

    const deliusData: any = null

    const payload = {
      locale: locale.en,
      data: {
        deliusData,
        planAgreementStatus: testPlan.agreementStatus,
        systemReturnUrl,
        pageId: 'about',
        formattedAssessmentInfo: assessmentAreas,
        readWrite: true,
      },
      errors: {
        domain: ['noDeliusDataFound'],
      },
    }

    expect(res.render).toHaveBeenCalledWith('pages/about', payload)
    expect(req.services.auditService.send).toHaveBeenCalledWith(AuditEvent.VIEW_ABOUT_PAGE)
  })

  it('should have an assessment error if SAN API call fails', async () => {
    req.services.assessmentService.getAssessmentByUuid = jest.fn().mockRejectedValue(new Error('API error'))

    await controller.get(req, res, next)

    const formattedAssessmentInfo: FormattedAssessment = {
      areas: {
        highScoring: [],
        incompleteAreas: [],
        lowScoring: [],
        other: [],
      },
      isAssessmentComplete: false,
    }

    const payload = {
      locale: locale.en,
      data: {
        deliusData: popData,
        planAgreementStatus: testPlan.agreementStatus,
        systemReturnUrl,
        pageId: 'about',
        formattedAssessmentInfo,
        readWrite: true,
      },
      errors: {
        domain: ['noAssessmentDataFound'],
      },
    }

    expect(res.render).toHaveBeenCalledWith('pages/about', payload)
    expect(req.services.auditService.send).toHaveBeenCalledWith(AuditEvent.VIEW_ABOUT_PAGE)
  })

  it('should return a 500 error if both API calls fail', async () => {
    req.services.assessmentService.getAssessmentByUuid = jest.fn().mockRejectedValue(new Error('API error'))
    req.services.infoService.getPopData = jest.fn().mockRejectedValue(new Error('API error'))

    await controller.get(req, res, next)

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 500 }))
    expect(req.services.auditService.send).not.toHaveBeenCalled()
  })
})

describe('AboutPersonController - assessment complete', () => {
  let controller: AboutPersonController
  let assessmentAreas: FormattedAssessment
  const req = mockReq()
  const res = mockRes()

  beforeEach(() => {
    jest.clearAllMocks()
    controller = new AboutPersonController()
    req.services.assessmentService.getAssessmentByUuid = jest.fn().mockResolvedValue(completeAssessmentData)
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
          systemReturnUrl,
          pageId: 'about',
          deliusData: popData,
          formattedAssessmentInfo: assessmentAreas,
          readWrite: true,
        },
        errors: {},
      }

      expect(res.render).toHaveBeenCalledWith('pages/about', payload)
      expect(req.services.auditService.send).toHaveBeenCalledWith(AuditEvent.VIEW_ABOUT_PAGE)
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
          systemReturnUrl,
          pageId: 'about',
          deliusData: popData,
          formattedAssessmentInfo: assessmentAreas,
          readWrite: false,
        },
        errors: {},
      }

      expect(res.render).toHaveBeenCalledWith('pages/about', payload)
      expect(req.services.auditService.send).toHaveBeenCalledWith(AuditEvent.VIEW_ABOUT_PAGE)
    })
  })
})

describe('AboutPersonController - assessment incomplete', () => {
  let controller: AboutPersonController
  const req = mockReq()
  const res = mockRes()
  let assessmentAreas: FormattedAssessment

  beforeEach(() => {
    jest.clearAllMocks()
    controller = new AboutPersonController()
    req.services.assessmentService.getAssessmentByUuid = jest.fn().mockResolvedValue(incompleteAssessmentData)
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
          systemReturnUrl,
          pageId: 'about',
          deliusData: popData,
          formattedAssessmentInfo: assessmentAreas,
          readWrite: true,
        },
        errors: {},
      }

      expect(res.render).toHaveBeenCalledWith('pages/about', expectedPayload)
      expect(req.services.auditService.send).toHaveBeenCalledWith(AuditEvent.VIEW_ABOUT_PAGE)
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
          systemReturnUrl,
          pageId: 'about',
          deliusData: popData,
          formattedAssessmentInfo: assessmentAreas,
          readWrite: false,
        },
        errors: {},
      }

      expect(res.render).toHaveBeenCalledWith('pages/about', expectedPayload)
      expect(req.services.auditService.send).toHaveBeenCalledWith(AuditEvent.VIEW_ABOUT_PAGE)
    })
  })
})
