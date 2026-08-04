import { Component, input, output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import {
  CourtApplicationType,
  HearingType,
  OrganisationUnit,
  Prosecutor,
  provideReferenceDataStore,
  ReferenceDataActions,
  ReferenceDataService
} from '@cpp/reference-data';
import { provideUsersGroupsStore, UsersGroupsActions, UsersGroupsService } from '@cpp/users-groups';
import { provideState, provideStore, Store } from '@ngrx/store';
import { AppConfig } from '../../../app.interfaces';
import { AppState, reducers } from '../../../app.reducer';
import { setAppConfiguration } from '../../../config/config.actions';
import { Breadcrumb } from '../../../shared/components/breadcrumbs.component';
import { SearchActions } from '../../actions';
import { SearchFormValues } from '../../components/search-form.component';
import { mockFive, mockFour, mockOne, mockThree } from '../../mocks/unified-search-cases.mock';
import { searchFeatureReducer } from '../../reducers/index';
import { UnifiedSearchApplication, UnifiedSearchCase } from '../../search.interfaces';
import { SearchUnifiedCasesParams } from '../../services/unified-search.service';
import { SearchContainerComponent } from '../search.container';
import { provideEffects } from '@ngrx/effects';
import { of } from 'rxjs';
import { REDIRECT_TOKEN } from '../../../../main';
import { provideCPPApplicationEnvironment, WofdWarningService } from '@cpp/application';
import { SearchComponent } from '../../components/search.component';
import { JsonPipe } from '@angular/common';

describe('SearchContainerComponent', () => {
  let fixture: ComponentFixture<SearchContainerComponent>;
  let redirectTo: jest.Mock;
  let router: Router;
  let store: Store<AppState>;
  let wofdWarningService: { isWofdApplication: jest.Mock; showModal: jest.Mock };

  const activatedRoute = new ActivatedRoute();
  const searchParams: SearchUnifiedCasesParams = {
    applicationType: 'CODE002',
    caseStatus: ['ACTIVE'],
    caseReference: '*',
    courtId: 'COURT001',
    partyLastNameOrOrganisationName: '*',
    partyAddress: '*',
    partyPostcode: '*',
    partyDateOfBirth: '1978-01-01',
    hearingDateFrom: '2019-01-01',
    hearingDateTo: '2019-01-02',
    hearingTypeId: 'TYPE001',
    sjp: true,
    crownCourt: true,
    magistrateCourt: true,
    prosecutingAuthority: 'TFL',
    sortBySjpNoticeServed: 'asc',
    partyTypes: 'DEFENDANT,APPLICANT'
  };

  beforeEach(() => {
    redirectTo = jest.fn();

    TestBed.configureTestingModule({
      providers: [
        provideStore(reducers, { runtimeChecks: {} }),
        provideEffects([]),
        provideCPPApplicationEnvironment({ production: false }),
        provideRouter([]),
        provideReferenceDataStore(),
        provideUsersGroupsStore(),
        provideState('search', searchFeatureReducer),

        {
          provide: ActivatedRoute,
          useValue: activatedRoute
        },
        {
          provide: REDIRECT_TOKEN,
          useValue: redirectTo
        },
        {
          provide: ReferenceDataService,
          useValue: {}
        },
        {
          provide: UsersGroupsService,
          useValue: {
            getUserSystemAnnouncement: jest.fn().mockReturnValue(of({ announcement: undefined }))
          }
        }
      ]
    })
      .overrideComponent(SearchContainerComponent, {
        remove: {
          imports: [SearchComponent]
        },
        add: {
          imports: [SearchMockComponent]
        }
      })
      .overrideProvider(WofdWarningService, {
        useValue: {
          isWofdApplication: jest.fn().mockReturnValue(false),
          showModal: jest.fn()
        }
      });

    fixture = TestBed.createComponent(SearchContainerComponent);
    router = TestBed.inject<Router>(Router);
    store = TestBed.inject(Store);
    wofdWarningService = TestBed.inject(WofdWarningService) as any;

    store.dispatch(
      setAppConfiguration({
        appConfig: {
          appUrl: 'https://test.tld'
        } as AppConfig
      })
    );

    store.dispatch(
      ReferenceDataActions.loadApplicationTypesSuccess({
        applicationTypes: [
          { code: 'CODE001', type: 'A' },
          { code: 'CODE002', type: 'B' }
        ] as CourtApplicationType[]
      })
    );

    store.dispatch(
      ReferenceDataActions.loadOrganisationUnitsSuccess({
        organisationUnits: [
          { id: 'COURT001', oucodeL3Name: 'A' },
          { id: 'COURT002', oucodeL3Name: 'B' }
        ] as OrganisationUnit[]
      })
    );

    store.dispatch(
      ReferenceDataActions.loadHearingTypesSuccess({
        hearingTypes: [
          { id: 'TYPE001', hearingDescription: 'A' },
          { id: 'TYPE002', hearingDescription: 'B' }
        ] as HearingType[]
      })
    );

    store.dispatch(
      ReferenceDataActions.loadProsecutorsSuccess({
        prosecutors: [
          { id: 'PROSECUTOR001', shortName: 'TFL' },
          { id: 'PROSECUTOR002', shortName: 'SJP' }
        ] as Prosecutor[]
      })
    );

    store.dispatch(
      SearchActions.loadUnifiedSearchCasesSuccess({
        totalResults: 25,
        cases: [{ caseId: '*' } as UnifiedSearchCase],
        params: {
          ...searchParams,
          pageSize: 10,
          startFrom: 20
        }
      })
    );

    router.navigate = jest.fn();
    jest.spyOn(store, 'dispatch');
  });

  it('should compile correctly', () => {
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should hande a `clearResults` event', () => {
    fixture.debugElement
      .query(By.directive(SearchMockComponent))
      .componentInstance.clearResults.emit({ isBoxWorkHearing: false });
    expect(store.dispatch).toHaveBeenLastCalledWith(
      SearchActions.resetSearch({ isBoxWorkHearing: false })
    );
  });

  // These specs should be enabled once the new SJP UI is in use:

  it('should handle a `postalReply` event for a Crown Court admin', () => {
    store.dispatch(
      UsersGroupsActions.setUserPermissions({
        userGroups: [
          { groupId: '1', description: 'mock-description', groupName: 'Crown Court Admin' }
        ]
      })
    );
    fixture.debugElement
      .query(By.directive(SearchMockComponent))
      .componentInstance.postalReply.emit(mockOne);

    expect(redirectTo).toHaveBeenCalledWith(
      `/sjp/court-admin/case-overview/${mockOne.caseId}/postal-plea/add-change-plea`
    );
  });

  it('should handle a `postalReply` event for a legal adviser', () => {
    store.dispatch(
      UsersGroupsActions.setUserPermissions({
        userGroups: [
          { groupId: '1', description: 'mock-description', groupName: 'Crown Court Admin' },
          { groupId: '2', description: 'mock-description', groupName: 'Legal Advisers' }
        ]
      })
    );
    fixture.debugElement
      .query(By.directive(SearchMockComponent))
      .componentInstance.postalReply.emit(mockOne);

    expect(redirectTo).toHaveBeenCalledWith(
      `/sjp/legal-adviser/case-overview/${mockOne.caseId}/postal-plea/add-change-plea`
    );
  });

  it('should handle a `viewApplication` event', () => {
    fixture.debugElement
      .query(By.directive(SearchMockComponent))
      .componentInstance.viewApplication.emit(mockOne);

    expect(wofdWarningService.isWofdApplication).toHaveBeenCalledWith([]);
    expect(redirectTo).toHaveBeenCalledWith(
      `/prosecution-casefile/application-at-a-glance/${mockOne.applications![0].applicationId}`
    );
  });

  it('should handle a `viewCrownCourtCase` event', () => {
    fixture.debugElement
      .query(By.directive(SearchMockComponent))
      .componentInstance.viewCrownCourtCase.emit(mockThree);

    expect(redirectTo).toHaveBeenCalledWith(
      `/prosecution-casefile/case-at-a-glance/${mockThree.caseId}`
    );
  });

  it('should handle a `viewApplicationAtAGlance` event', () => {
    fixture.debugElement
      .query(By.directive(SearchMockComponent))
      .componentInstance.viewApplicationAtAGlance.emit(mockFive.applications![0]);

    expect(redirectTo).toHaveBeenCalledWith(
      `/prosecution-casefile/application-at-a-glance/${mockFive.applications![0].applicationId}`
    );
  });

  it('should show WOFD modal when viewApplication is triggered for a WOFD application', () => {
    const wofdCase: UnifiedSearchCase = {
      ...mockOne,
      applications: [
        {
          ...mockOne.applications![0],
          applicationTypeCode: 'PL84501'
        }
      ] as UnifiedSearchApplication[]
    };
    wofdWarningService.isWofdApplication.mockReturnValueOnce(true);

    fixture.debugElement
      .query(By.directive(SearchMockComponent))
      .componentInstance.viewApplication.emit(wofdCase);

    expect(wofdWarningService.isWofdApplication).toHaveBeenCalledWith([{ code: 'PL84501' }]);
    expect(wofdWarningService.showModal).toHaveBeenCalledWith(
      expect.objectContaining({ onProceed: expect.any(Function) })
    );
    expect(redirectTo).not.toHaveBeenCalled();
  });

  it('should show WOFD modal when viewApplicationAtAGlance is triggered for a WOFD application', () => {
    wofdWarningService.isWofdApplication.mockReturnValueOnce(true);

    fixture.debugElement
      .query(By.directive(SearchMockComponent))
      .componentInstance.viewApplicationAtAGlance.emit(mockFive.applications![0]);

    expect(wofdWarningService.showModal).toHaveBeenCalledWith(
      expect.objectContaining({ onProceed: expect.any(Function) })
    );
    expect(redirectTo).not.toHaveBeenCalled();
  });

  it('should navigate to AAAG when WOFD modal proceed is clicked', () => {
    const wofdCase: UnifiedSearchCase = {
      ...mockOne,
      applications: [
        {
          ...mockOne.applications![0],
          applicationTypeCode: 'PL84501'
        }
      ] as UnifiedSearchApplication[]
    };
    wofdWarningService.isWofdApplication.mockReturnValueOnce(true);

    fixture.debugElement
      .query(By.directive(SearchMockComponent))
      .componentInstance.viewApplication.emit(wofdCase);

    const { onProceed } = wofdWarningService.showModal.mock.calls[0][0];
    onProceed();

    expect(redirectTo).toHaveBeenCalledWith(
      `/prosecution-casefile/application-at-a-glance/${mockOne.applications![0].applicationId}`
    );
  });

  // These specs should be enabled once the new SJP UI is in use:

  it('should handle a `viewSjpCase` event for a Crown Court admin', () => {
    store.dispatch(
      UsersGroupsActions.setUserPermissions({
        userGroups: [
          { groupId: '1', description: 'mock-description', groupName: 'Crown Court Admin' }
        ]
      })
    );
    fixture.debugElement
      .query(By.directive(SearchMockComponent))
      .componentInstance.viewSjpCase.emit(mockFour);

    expect(redirectTo).toHaveBeenCalledWith(`/sjp/court-admin/case-overview/${mockFour.caseId}`);
  });

  it('should handle a `viewSjpCase` event for a legal adviser', () => {
    store.dispatch(
      UsersGroupsActions.setUserPermissions({
        userGroups: [
          { groupId: '1', description: 'mock-description', groupName: 'Crown Court Admin' },
          { groupId: '2', description: 'mock-description', groupName: 'Legal Advisers' }
        ]
      })
    );
    fixture.debugElement
      .query(By.directive(SearchMockComponent))
      .componentInstance.viewSjpCase.emit(mockFour);

    expect(redirectTo).toHaveBeenCalledWith(`/sjp/legal-adviser/case-overview/${mockFour.caseId}`);
  });

  it('should hande a `search` event', () => {
    fixture.debugElement.query(By.directive(SearchMockComponent)).componentInstance.search.emit({
      applicationType: { code: 'CODE001', type: 'C' } as CourtApplicationType,
      hearingType: { id: 'TYPE0001' } as HearingType,
      organisationUnit: { id: 'COURT001' } as OrganisationUnit,
      prosecutor: { id: 'PROSECUTOR001', shortName: 'SJP' } as Prosecutor,
      caseReference: '*'
    });
    expect(router.navigate).toHaveBeenCalledWith(['.'], {
      relativeTo: activatedRoute,
      queryParams: {
        applicationType: 'C',
        courtId: 'COURT001',
        hearingTypeId: 'TYPE0001',
        prosecutingAuthority: 'SJP',
        caseReference: '*'
      }
    });
  });

  it('should hande a `startFromChange` event', () => {
    fixture.debugElement
      .query(By.directive(SearchMockComponent))
      .componentInstance.startFromChange.emit(20);
    expect(router.navigate).toHaveBeenCalledWith(['.'], {
      relativeTo: activatedRoute,
      queryParams: {
        ...searchParams,
        startFrom: 20
      }
    });
  });
});

@Component({
  selector: 'app-search',
  template: `
    breadcrumbs: {{ breadcrumbs() | json }}<br />
    initialFormValues: {{ initialFormValues() | json }}<br />
    pageSize: {{ pageSize() }}<br />
    results: {{ results() | json }}<br />
    startFrom: {{ startFrom() }}<br />
    totalResults: {{ totalResults() }}<br />
  `,
  imports: [JsonPipe]
})
class SearchMockComponent {
  breadcrumbs = input<Breadcrumb[]>([]);
  initialFormValues = input<SearchFormValues>();
  pageSize = input(10);
  results = input<UnifiedSearchCase[]>([]);
  startFrom = input(0);
  totalResults = input(-1);
  readonly clearResults = output<{
    isBoxWorkHearing: boolean;
  }>();
  readonly postalReply = output<UnifiedSearchCase>();
  readonly search = output<SearchFormValues>();
  readonly startFromChange = output<number>();
  readonly viewApplication = output<UnifiedSearchCase>();
  readonly viewCrownCourtCase = output<UnifiedSearchCase>();
  readonly viewSjpCase = output<UnifiedSearchCase>();
  readonly viewApplicationAtAGlance = output<UnifiedSearchApplication>();
}
