import HandoverContextService from './handover/handoverContextService'
import PlanService from './sentence-plan/planService'
import Logger from '../../logger'

export default class SessionService {
  constructor(
    private readonly request: Express.Request,
    private readonly handoverContextService: HandoverContextService,
    private readonly planService: PlanService,
  ) {}

  setupSession = async () => {
    try {
      this.request.session.handover = await this.handoverContextService.getContext(this.request.user?.token)

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

  getOasysReturnUrl = () => this.request.session.handover?.principal.returnUrl

  getReturnLink = () => this.request.session.returnLink

  setReturnLink = (returnLink: string) => {
    this.request.session.returnLink = returnLink
  }
}
