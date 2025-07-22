import HandoverContextService from './handover/handoverContextService'
import PlanService from './sentence-plan/planService'
import Logger from '../../logger'
import {AccessMode, Gender} from '../@types/Handover'

export default class SessionService {
  constructor(
    private readonly request: Express.Request,
    private readonly handoverContextService: HandoverContextService,
    private readonly planService: PlanService,
  ) {}

  setupSession = async () => {
    try {
      this.request.session.handover = await this.handoverContextService.getContext(this.request.user?.token)

      const subjectCRN = this.getSubjectDetails()?.crn
      if (subjectCRN) {
        await this.request.services.planService.associate(this.getPlanUUID(), subjectCRN)
      }

      if (this.getPlanVersionNumber() != null) {
        this.request.session.plan = await this.planService.getPlanByUuidAndVersionNumber(
          this.getPlanUUID(),
          this.getPlanVersionNumber(),
        )
      } else {
        this.request.session.plan = await this.planService.getPlanByUuid(this.getPlanUUID())
      }
    } catch (e) {
      Logger.error('Failed to setup session:', e)
      throw Error(e)
    }
  }

  setupAuthSession = async () => {
    try {
      // const deliusData = await this.infoService.getPopData('X000001')
      // console.log(deliusData);

      this.request.session.handover = {
        assessmentContext: {
          oasysAssessmentPk: '',
          assessmentVersion: 0
        },
        criminogenicNeedsData: {},
        handoverSessionId: '',
        principal: {
          identifier: 'X',
          displayName: this.request.user.username,
          accessMode: AccessMode.READ_WRITE
        },
        subject: {
          crn: 'X000001',
          pnc: '01/01PNC',
          givenName: 'Alex',
          familyName: 'Alexandersson',
          dateOfBirth: '01-01-1960',
          gender: Gender.NotSpecified,
          location: 'PRISON'
        },
        sentencePlanContext: {
          oasysAssessmentPk: '',
          planId: '56528271-fafa-4e8c-a1c9-56e2a8a7c878',
          planVersion: null, // null as it isHistoricalPlan (and READ_ONLY) if anything else specified.
        }
      }

      if (this.getPlanVersionNumber() != null) {
        this.request.session.plan = await this.planService.getPlanByUuidAndVersionNumber(
          this.getPlanUUID(),
          this.getPlanVersionNumber(),
        )
      } else {
        this.request.session.plan = await this.planService.getPlanByUuid(this.getPlanUUID())
      }
    } catch (e) {
      Logger.error('Failed to setup session:', e)
      throw Error(e)
    }
  }

  getPlanUUID = () => this.request.session.handover?.sentencePlanContext.planId

  getPlanVersionNumber = () => this.request.session.handover?.sentencePlanContext.planVersion

  getPrincipalDetails = () => this.request.session.handover?.principal

  getSubjectDetails = () => this.request.session.handover?.subject

  getAccessMode = () => {
    const isReadOnlyUser = this.getPrincipalDetails().accessMode === AccessMode.READ_ONLY
    const isHistoricalPlan = this.getPlanVersionNumber() !== null

    if (isReadOnlyUser || isHistoricalPlan) {
      return AccessMode.READ_ONLY
    }

    return AccessMode.READ_WRITE
  }

  getOasysReturnUrl = () => this.request.session.handover?.principal.returnUrl

  getCriminogenicNeeds = () => this.request.session.handover?.criminogenicNeedsData

  getReturnLink = () => this.request.session.returnLink

  setReturnLink = (returnLink: string) => {
    this.request.session.returnLink = returnLink
  }
}
