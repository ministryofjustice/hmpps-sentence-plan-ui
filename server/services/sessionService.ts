import * as Express from 'express'
import { jwtDecode } from 'jwt-decode'
import HandoverContextService from './handover/handoverContextService'
import PlanService from './sentence-plan/planService'
import Logger from '../../logger'
import { JwtPayloadExtended } from '../@types/Token'
import { AccessMode, AuthType, Gender } from '../@types/SessionType'

export default class SessionService {
  constructor(
    private readonly request: Express.Request,
    private readonly handoverContextService: HandoverContextService,
    private readonly planService: PlanService,
  ) {}

  setupSessionFromHandover = async () => {
    try {
      const handoverContext = await this.handoverContextService.getContext(this.request.user?.token)
      const subjectCRN = handoverContext.subject.crn
      const { planId, planVersion } = handoverContext.sentencePlanContext

      this.request.session.principal = {
        ...handoverContext.principal,
        authType: AuthType.OASYS,
      }
      this.request.session.subject = handoverContext.subject
      this.request.session.criminogenicNeeds = handoverContext.criminogenicNeedsData

      if (subjectCRN) {
        await this.request.services.planService.associate(planId, subjectCRN)
      }

      this.request.session.plan = {
        id: planId,
        version: planVersion,
      }
    } catch (e) {
      Logger.error('Failed to setup handover-based session:', e)
      throw Error(e)
    }
  }

  setupPrincipleFromAuth = async (token: string) => {
    try {
      const { name, user_uuid: userUuid } = jwtDecode<JwtPayloadExtended>(token)

      this.request.session.principal = {
        identifier: userUuid,
        displayName: name,
        accessMode: AccessMode.READ_WRITE,
        authType: AuthType.HMPPS_AUTH,
      }
    } catch (e) {
      Logger.error('Failed to setup hmpps-auth-based session:', e)
      throw Error(e.message)
    }
  }

  setupSessionFromAuth = async (crn: string) => {
    try {
      const deliusData = await this.request.services.infoService.getPopData(crn).catch((): null => null)

      this.request.session.subject = {
        crn: deliusData.crn,
        pnc: 'UNKNOWN PNC',
        givenName: deliusData.firstName,
        familyName: deliusData.lastName,
        dateOfBirth: deliusData.doB,
        gender: Gender.NotSpecified,
        location: 'COMMUNITY',
      }

      const planDetails = await this.planService.getPlanByCrn(crn)

      this.request.session.plan = {
        id: planDetails.uuid,
        version: null,
      }
    } catch (e) {
      Logger.error('Failed to setup hmpps-auth-based session:', e)
      throw Error(e.message)
    }
  }

  getPlanUUID = () => this.request.session?.plan?.id

  getPlanVersionNumber = () => this.request.session?.plan?.version

  getPrincipalDetails = () => this.request.session.principal

  getSubjectDetails = () => this.request.session.subject

  getAccessMode = () => {
    const isReadOnlyUser = this.getPrincipalDetails().accessMode === AccessMode.READ_ONLY
    const isHistoricalPlan = this.getPlanVersionNumber() !== null

    if (isReadOnlyUser || isHistoricalPlan) {
      return AccessMode.READ_ONLY
    }

    return AccessMode.READ_WRITE
  }

  getSystemReturnUrl = () => this.request.session.principal?.returnUrl

  getCriminogenicNeeds = () => this.request.session.criminogenicNeeds

  getReturnLink = () => this.request.session.returnLink

  setReturnLink = (returnLink: string) => {
    this.request.session.returnLink = returnLink
  }
}
