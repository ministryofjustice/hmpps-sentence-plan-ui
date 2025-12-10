import { AccessMode } from '../../@types/SessionType'
import { HandoverContextData } from '../../@types/Handover'

const testHandoverContext: HandoverContextData = {
  handoverSessionId: 'e7501b21-3951-426d-9a73-0c2c4527aa27',
  principal: {
    identifier: 'a23ccacf-7160-4431-9b4d-c560be9c9f5c',
    displayName: 'Dr. Benjamin Runolfsdottir',
    accessMode: AccessMode.READ_WRITE,
    returnUrl: 'https://oasys.return.url',
  },
  subject: {
    crn: 'X336018',
    pnc: '01/14106572A',
    nomisId: '',
    givenName: 'Buster',
    familyName: 'Sanford',
    dateOfBirth: '2002-01-15',
    gender: 1,
    location: 'COMMUNITY',
    sexuallyMotivatedOffenceHistory: 'YES',
  },
  assessmentContext: { oasysAssessmentPk: '306708', assessmentVersion: 0 },
  sentencePlanContext: {
    oasysAssessmentPk: '306708',
    planId: 'affo3cacf-7160-4431-9b4d-c560be9c9f5c',
    planVersion: 0,
  },
}

export default testHandoverContext
