import { auditService } from '@ministryofjustice/hmpps-audit-client'
import logger from '../../logger'
import { ApplicationInfo } from '../applicationInfo'
import SessionService from './sessionService'

export enum AuditEvent {
  VIEW_PLAN_OVERVIEW_PAGE = 'VIEW_PLAN_OVERVIEW_PAGE',
  CREATE_A_GOAL = 'CREATE_A_GOAL',
  CHANGE_A_GOAL = 'CHANGE_A_GOAL',
  ADD_OR_CHANGE_STEPS = 'ADD_OR_CHANGE_STEPS',
  DELETE_A_GOAL = 'DELETE_A_GOAL',
  REMOVE_A_GOAL = 'REMOVE_A_GOAL',
  AGREE_PLAN = 'AGREE_PLAN',
  UPDATE_AGREEMENT = 'UPDATE_AGREEMENT',
  VIEW_UPDATE_GOAL_AND_STEPS_PAGE = 'VIEW_UPDATE_GOAL_AND_STEPS_PAGE',
  UPDATE_GOAL_AND_STEPS = 'UPDATE_GOAL_AND_STEPS',
  MARK_GOAL_AS_ACHIEVED = 'MARK_GOAL_AS_ACHIEVED',
  ADD_A_GOAL_BACK_TO_PLAN = 'ADD_A_GOAL_BACK_TO_PLAN',
  VIEW_GOAL_DETAILS = 'VIEW_GOAL_DETAILS',
  VIEW_ABOUT_PAGE = 'VIEW_ABOUT_PAGE',
  VIEW_PLAN_HISTORY_PAGE = 'VIEW_PLAN_HISTORY_PAGE',
  VIEW_PREVIOUS_VERSIONS_PAGE = 'VIEW_PREVIOUS_VERSIONS_PAGE',
}

export default class AuditService {
  constructor(
    private readonly applicationInfo: ApplicationInfo,
    private readonly sessionService: SessionService,
    private readonly correlationId: string,
  ) {}

  async send(event: AuditEvent, details: any = {}) {
    try {
      await auditService.sendAuditMessage({
        action: event,
        who: this.sessionService.getPrincipalDetails()?.identifier,
        subjectId: this.sessionService.getSubjectDetails()?.crn,
        subjectType: 'CRN',
        service: this.applicationInfo.applicationName,
        correlationId: this.correlationId,
        details: JSON.stringify({
          planUUID: this.sessionService.getPlanUUID(),
          planVersionNumber: this.sessionService.getPlanVersionNumber(),
          ...details,
        }),
      })
      logger.info(`HMPPS Audit event sent successfully (${event})`)
    } catch (error) {
      logger.error(`Error sending HMPPS Audit event (${event}):`, error)
    }
  }
}
