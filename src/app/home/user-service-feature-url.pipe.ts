import { Pipe, PipeTransform } from '@angular/core';
import { UserServiceFeature } from '@cpp/users-groups';

const serviceFeatureMap: Record<string, string> = {
  'bulkscan-reviewNewDocuments': '/bulkscan/',
  'defence-findCase': '/defence/',
  'defence-assignCase': '/defence/assign-case',
  'defence-assignCaseByHearing': '/defence/assign-hearing-cases',
  'defence-advocateAccess': '/defence/assign-case/find-advocate-case',
  'driver-record-search-audit': '/external-services/dvla/search-audit/',
  'find-non-cps-case': '/defence/assign-case/find-non-cps-case',
  'find-available-sessions': '/listing/find-available-sessions',
  'hearing-checkInToHearings': '/hearing/check-in',
  'hearing-viewList': '/hearing/list',
  'hearing-viewListAndManageHearings': '/hearing/list',
  'listing-allocatedHearings': '/listing/allocated',
  'listing-manageCourtCalendar': '/listing/court-calendar',
  'listing-downloadHearingLists': '/listing/create-a-list',
  'listing-publishAndDownloadHearingLists': '/listing/create-a-list',
  'listing-downloadPrisonLists': '/listing/create-prison-list',
  'listing-unallocatedHearings': '/listing/unallocated',
  'listing-unscheduledListings': '/listing/unscheduled',
  'magistrates-list': '/hearing/magistrates-list',
  'matched-defendants': '/prosecution-casefile/matched-defendants/list',
  'manage-caseActivities': '/work-management/',
  'search-manageBoxWork': '/search/?boxWorkHearing=true',
  'search-for-driver-record': '/external-services/dvla/simple-search',
  'opami-inFlightDashboard': '/reporting/in-flight',
  'outstanding-fine': '/hearing/outstanding-fines/create-report',
  'prosecutionCasefile-createCourtMediaRegister': '/prosecution-casefile/media-register',
  'prosecutionCasefile-createCaseOrApplication': '/prosecution-casefile/manual-case/type',
  'prosecutionCasefile-createCaseOrApplicationSJP': `/prosecution-casefile/manual-case/prosecutor?type=J`,
  'prosecutionCasefile-fixCaseInterfaceErrors': '/prosecution-casefile/spi-errors',
  'prosecutionCasefile-createMigratedCase': '/prosecution-casefile/manual-case/migrated-case',
  'prosecutionCasefile-search': '/prosecution-casefile/search',
  'prosecutor-search': 'prosecutor-search',
  'record-court-room-use': '/hearing/session-times',
  'reporting-viewOutstandingCases': '/reporting/atcm',
  'reporting-outStandingCases': '/reporting/atcm',
  'refData-CreateSittingPattern': '/refdata/sitting/create',
  'refData-EditOrCloneSittingPattern': '/refdata/sitting/edit',
  'sjp-startANewSession': '/sjp/legal-adviser/session/start',
  'sjp-caseErrors': '/sjp/hmcts/case-errors',
  'sjp-completedCases': '/sjp/hmcts/completed-cases',
  'sjp-createMediaRegister': '/sjp/hmcts/create-media-register',
  'sjp-notGuiltyPleaList': '/sjp/hmcts/not-guilty-plea-list',
  'sjp-pressList': '/sjp/hmcts/press-list',
  'sjp-publicList': '/sjp/hmcts/public-list',
  'sjp-search': '/sjp/hmcts/search',
  'sjp-perform-legal-soc-check': '/sjp/soc-check',
  'userManagement-manageRoles': '/manage-permissions/manage/roles',
  'userManagement-manageUserAccess': '/manage-permissions/user-access/manage/organisation',
  'publish-downtime-announcements': '/manage-permissions/announcements',
  subscriptionsPortal: '/subscriptions/',
  'courtscheduler-create': '/courtscheduler/create',
  'courtscheduler-view': '/courtscheduler/view',
  'courtscheduler-manageJudiciaryItinerary': '/courtscheduler/manage-judicial-itinerary',
  'crime-platform-audit': '/audit-reports/create',
  'manage-your-complaints-files': '/prosecutor/manage-your-complaints-files'
};

@Pipe({ name: 'userServiceFeatureUrl' })
export class UserServiceFeatureUrlPipe implements PipeTransform {
  transform(feature: UserServiceFeature): string {
    return serviceFeatureMap[feature.key];
  }
}
