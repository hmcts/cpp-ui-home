export interface UnifiedSearchApplication {
  applicationId?: string;
  applicationReference: string;
  applicationType: string;
  applicationTypeCode?: string;
  applicationStatus?: ApplicationStatus;
  dueDate?: string;
  receivedDate?: string;
}

export interface UnifiedSearchCase {
  caseId: string;
  caseReference: string;
  applicationTypeName?: string;
  dueDate?: string;
  sjp: boolean;
  crownCourt: boolean;
  magistrateCourt: boolean;
  sjpNoticeServed?: string;
  caseStatus?: UnifiedSearchCaseStatus;
  parties: UnifiedSearchParty[];
  court?: string;
  applications?: UnifiedSearchApplication[];
  hearings?: UnifiedSearchHearing[];
  prosecutingAuthority?: string;
  caseType: 'APPLICATION' | 'PROSECUTION';
  sourceSystemReference?: string;
}

export type CaseStatus = 'ACTIVE' | 'INACTIVE';

export type UnifiedSearchCaseStatus =
  | 'COMPLETED'
  | 'NO_PLEA_RECEIVED'
  | 'NO_PLEA_RECEIVED_READY_FOR_DECISION'
  | 'PLEA_RECEIVED_READY_FOR_DECISION'
  | 'PLEA_RECEIVED_NOT_READY_FOR_DECISION'
  | 'REFERRED_FOR_COURT_HEARING'
  | 'REOPENED_IN_LIBRA'
  | 'UNKNOWN'
  | 'WITHDRAWAL_REQUEST_READY_FOR_DECISION';

export interface UnifiedSearchHearing {
  hearingId: string;
  courtId: string;
  courtCentreName?: string;
  hearingTypeId: string;
  hearingDates: string[];
  hearingDays?: UnifiedSearchHearingDay[];
  hearingTypeLabel: string;
  jurisdictionType: string;
  judiciaryTypes?: string[];
  assignedTo?: {
    firstName: string;
    lastName: string;
  };
  isBoxHearing?: boolean;
  isVirtualBoxHearing?: boolean;
  boxWorkAssignedUserId?: string;
  boxWorkTaskStatus?: 'IN_PROGRESS' | 'COMPLETE';
}

export interface UnifiedSearchParty {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  partyType: 'DEFENDANT' | 'APPLICANT' | 'RESPONDENT';
  organisationName?: string;
  dateOfBirth?: string;
  addressLines?: string;
  postCode?: string;
}

export interface UnifiedSearchHearingDay {
  sittingDay: string;
  listingSequence: number;
  listedDurationMinutes: number;
}

export enum ApplicationStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  EJECTED = 'EJECTED',
  LISTED = 'LISTED',
  FINALISED = 'FINALISED',
  DRAFT = 'DRAFT',
  UN_ALLOCATED = 'UN_ALLOCATED'
}
