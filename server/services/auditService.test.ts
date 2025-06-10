import { auditService } from '@ministryofjustice/hmpps-audit-client'
import AuditService, { AuditEvent } from './auditService'
import logger from '../../logger'
import { ApplicationInfo } from '../applicationInfo'

jest.mock('@ministryofjustice/hmpps-audit-client')
jest.mock('../../logger')

const mockSendAuditMessage = jest.fn()
auditService.sendAuditMessage = mockSendAuditMessage

describe('AuditService', () => {
  const mockAppInfo = { applicationName: 'TestApp' } as unknown as ApplicationInfo
  const mockCorrelationId = 'abc-123'
  const mockSessionService = {
    getPrincipalDetails: jest.fn(),
    getSubjectDetails: jest.fn(),
    getPlanUUID: jest.fn(),
    getPlanVersionNumber: jest.fn(),
  }

  let auditServiceInstance: AuditService

  beforeEach(() => {
    jest.clearAllMocks()

    mockSessionService.getPrincipalDetails.mockReturnValue({ identifier: 'user-1' })
    mockSessionService.getSubjectDetails.mockReturnValue({ crn: 'X12345' })
    mockSessionService.getPlanUUID.mockReturnValue('plan-uuid')
    mockSessionService.getPlanVersionNumber.mockReturnValue(2)

    auditServiceInstance = new AuditService(mockAppInfo, mockSessionService as any, mockCorrelationId)
  })

  it('should send audit message with correct payload', async () => {
    const customDetails = { foo: 'bar' }

    await auditServiceInstance.send(AuditEvent.CREATE_A_GOAL, customDetails)

    expect(mockSendAuditMessage).toHaveBeenCalledWith({
      action: AuditEvent.CREATE_A_GOAL,
      who: 'user-1',
      subjectId: 'X12345',
      subjectType: 'CRN',
      service: 'TestApp',
      correlationId: 'abc-123',
      details: JSON.stringify({
        planUUID: 'plan-uuid',
        planVersionNumber: 2,
        foo: 'bar',
      }),
    })

    expect(logger.info).toHaveBeenCalledWith('HMPPS Audit event sent successfully (CREATE_A_GOAL)')
  })

  it('should log an error if audit sending fails', async () => {
    const error = new Error('Boom!')
    mockSendAuditMessage.mockRejectedValue(error)

    await auditServiceInstance.send(AuditEvent.DELETE_A_GOAL)

    expect(logger.error).toHaveBeenCalledWith('Error sending HMPPS Audit event (DELETE_A_GOAL):', error)
  })
})
