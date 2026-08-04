import { UnifiedSearchApplication, UnifiedSearchCase } from '../search.interfaces';

export const mockOne: UnifiedSearchCase = {
  caseId: 'mock-case-id-1',
  caseReference: 'ARN GB123456789',
  caseType: 'APPLICATION',
  applicationTypeName: '*',
  court: `Liverpool Magistrates' Court`,
  parties: [
    {
      firstName: 'Lydia',
      middleName: 'Cleveland',
      lastName: 'Hanson',
      organisationName: 'Pyrami',
      dateOfBirth: '1959-12-04',
      partyType: 'APPLICANT'
    }
  ],
  applications: [
    {
      applicationId: 'mock-application-id-1',
      applicationReference: '5ce3bfd664f3117bedcfee90',
      applicationType: 'Application for witness summons',
      receivedDate: '2019-05-17',
      dueDate: '2019-10-20'
    }
  ] as UnifiedSearchApplication[],
  sjp: false,
  crownCourt: false,
  magistrateCourt: true
};

export const mockTwo: UnifiedSearchCase = {
  caseId: 'mock-case-id-2',
  caseReference: '*',
  caseType: 'APPLICATION',
  applicationTypeName: '*',
  court: `Liverpool Magistrates' Court`,
  parties: [
    {
      firstName: 'Lydia',
      middleName: 'Cleveland',
      lastName: 'Hanson',
      organisationName: 'Pyrami',
      dateOfBirth: '1959-12-04',
      partyType: 'APPLICANT'
    },
    {
      firstName: 'James',
      lastName: 'Davis',
      dateOfBirth: '1959-12-04',
      partyType: 'DEFENDANT'
    },
    {
      firstName: 'Scarlett',
      lastName: 'Moore',
      dateOfBirth: '1989-11-12',
      partyType: 'RESPONDENT'
    },
    {
      firstName: 'Joanne',
      lastName: 'Murr',
      dateOfBirth: '1959-12-04',
      partyType: 'RESPONDENT'
    }
  ],
  applications: [
    {
      applicationId: 'mock-application-id-1',
      applicationReference: 'ARN GB987654321',
      applicationType: 'Application for witness summons',
      receivedDate: '2019-05-17',
      dueDate: '2019-05-20',
      applicationStatus: 'IN_PROGRESS'
    },
    {
      applicationId: 'mock-application-id-2',
      applicationReference: '53NP2628622',
      applicationType: 'Failing to comply with the requirements of a community order',
      receivedDate: '2022-01-20',
      applicationStatus: 'DRAFT'
    },
    {
      applicationId: 'mock-application-id-3',
      applicationReference: '53NP2628617',
      applicationType: 'Failing to comply with the requirements of a community order',
      receivedDate: '2022-01-20',
      applicationStatus: 'EJECTED'
    },
    {
      applicationId: 'mock-application-id-4',
      applicationReference: '53NP2628622',
      applicationType:
        'Brought before the Court following imposition of custodial sentence in absence',
      receivedDate: '2022-01-25',
      applicationStatus: 'LISTED'
    },
    {
      applicationId: 'mock-application-id-5',
      applicationReference: '53NP2628622',
      applicationType: 'Review of community order',
      receivedDate: '2022-01-19',
      applicationStatus: 'FINALISED'
    }
  ] as UnifiedSearchApplication[],
  sjp: false,
  crownCourt: false,
  magistrateCourt: true
};

export const mockThree: UnifiedSearchCase = {
  caseId: 'mock-case-id-3',
  caseReference: 'URN GB987654321',
  caseType: 'PROSECUTION',
  court: `Liverpool Magistrates' Court`,
  parties: [
    {
      firstName: 'Lydia',
      middleName: 'Cleveland',
      lastName: 'Hanson',
      organisationName: 'Pyrami',
      dateOfBirth: '1959-12-04',
      addressLines: 'Address line one, Address line two',
      postCode: 'CR0 0NO',
      partyType: 'DEFENDANT'
    },
    {
      firstName: 'Lydia',
      middleName: 'Cleveland',
      lastName: 'Hanson',
      organisationName: 'Pyrami',
      dateOfBirth: '1959-12-04',
      postCode: 'CR0 0NO',
      partyType: 'RESPONDENT'
    },
    {
      firstName: 'Lydia',
      middleName: 'Cleveland',
      lastName: 'Hanson',
      organisationName: 'Pyrami',
      dateOfBirth: '1959-12-04',
      partyType: 'RESPONDENT'
    }
  ],
  applications: [
    {
      applicationId: 'mock-application-id-6',
      applicationReference: '5ce3bfd664f3117bedcfee90',
      applicationType: 'Application for witness summons',
      receivedDate: '2019-05-17',
      dueDate: '2019-10-20',
      applicationStatus: 'DRAFT'
    },
    {
      applicationId: 'mock-application-id-7',
      applicationReference: '53NP2628622',
      applicationType: 'Review of community order',
      receivedDate: '2022-01-19',
      applicationStatus: 'FINALISED'
    }
  ] as UnifiedSearchApplication[],
  hearings: [
    {
      hearingId: 'mock-hearing-id-1',
      courtId: '*',
      jurisdictionType: '*',
      hearingTypeId: '06b0c2bf-3f98-46ed-ab7e-56efaf9ecced',
      hearingDates: ['2019-09-17'],
      hearingTypeLabel: 'Hearing type label 1'
    },
    {
      hearingId: 'mock-hearing-id-2',
      courtId: '*',
      jurisdictionType: '*',
      hearingTypeId: 'Appeal',
      hearingDates: ['2019-05-18'],
      hearingTypeLabel: 'Hearing type label 2'
    }
  ],
  sjp: false,
  prosecutingAuthority: 'CPS',
  crownCourt: false,
  magistrateCourt: true
};

export const mockFour: UnifiedSearchCase = {
  caseId: 'mock-case-id-4',
  caseReference: 'URN GB123456789',
  caseStatus: 'UNKNOWN',
  caseType: 'PROSECUTION',
  court: `Liverpool Magistrates' Court`,
  parties: [
    {
      firstName: 'Lydia',
      middleName: 'Cleveland',
      lastName: 'Hanson',
      organisationName: 'Pyrami',
      dateOfBirth: '1959-12-04',
      addressLines: 'Address line one, Address line two',
      postCode: 'CR0 0NO',
      partyType: 'DEFENDANT'
    }
  ],
  applications: [],
  hearings: [],
  prosecutingAuthority: 'CPS',
  sjp: true,
  sjpNoticeServed: '2019-01-02',
  crownCourt: false,
  magistrateCourt: false
};

export const mockFive: UnifiedSearchCase = {
  caseId: 'mock-case-id-5',
  caseReference: '*',
  caseType: 'APPLICATION',
  applicationTypeName: 'APPLICATION_NAME',
  parties: [
    {
      firstName: 'Lydia',
      middleName: 'Cleveland',
      lastName: 'Hanson',
      organisationName: 'Pyrami',
      dateOfBirth: '1959-12-04',
      partyType: 'APPLICANT'
    },
    {
      firstName: 'James',
      lastName: 'Davis',
      dateOfBirth: '1959-12-04',
      partyType: 'DEFENDANT'
    },
    {
      firstName: 'Scarlett',
      lastName: 'Moore',
      dateOfBirth: '1989-11-12',
      partyType: 'RESPONDENT'
    },
    {
      firstName: 'Joanne',
      lastName: 'Murr',
      dateOfBirth: '1959-12-04',
      partyType: 'RESPONDENT'
    }
  ],
  applications: [
    {
      applicationId: 'mock-application-id-8',
      applicationReference: 'ARN GB987654321',
      applicationType: 'Application for witness summons',
      receivedDate: '2019-05-17',
      dueDate: '2019-05-20',
      applicationStatus: 'DRAFT'
    }
  ] as UnifiedSearchApplication[],
  hearings: [
    {
      courtId: '*',
      courtCentreName: `Liverpool Magistrates' Court`,
      hearingId: '*',
      hearingTypeId: '*',
      hearingTypeLabel: '*',
      hearingDates: ['2020-01-02'],
      isBoxHearing: false,
      jurisdictionType: 'CROWN',
      assignedTo: {
        firstName: 'James',
        lastName: 'Gray'
      }
    }
  ],
  sjp: false,
  crownCourt: false,
  magistrateCourt: true
};
