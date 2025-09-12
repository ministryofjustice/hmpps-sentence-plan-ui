import { AccessMode, AuthType, HandoverContextData } from '../../@types/Handover'

const authContextData: HandoverContextData = {
  assessmentContext: { oasysAssessmentPk: '', assessmentVersion: 0 },
  criminogenicNeedsData: {},
  handoverSessionId: '',
  principal: {
    accessMode: AccessMode.READ_WRITE,
    authType: AuthType.HMPPS_AUTH,
    identifier: 'a23ccacf-7160-4431-9b4d-c560be9c9f5c',
    displayName: 'Dr. Benjamin Runolfsdottir',
    returnUrl: 'http://localhost:9090/auth/sign-in?redirect_uri=http://localhost:3001/sign-in/hmpps-auth/callback',
  },
  sentencePlanContext: {
    oasysAssessmentPk: '',
    planId: 'draft-plan-uuid',
    planVersion: null,
  },
  subject: {
    crn: 'X775086',
    pnc: 'UNKNOWN PNC',
    givenName: 'Buster',
    familyName: 'Sanford',
    dateOfBirth: '2002-01-15',
    gender: 9,
    location: 'COMMUNITY',
  },
}

export default authContextData
