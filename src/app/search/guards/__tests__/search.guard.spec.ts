import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { UsersGroupsActions, RolePermission, provideUsersGroupsStore } from '@cpp/users-groups';
import { provideEffects } from '@ngrx/effects';
import { provideStore, Store } from '@ngrx/store';
import { omit } from 'ramda';
import { of, throwError } from 'rxjs';
import { AppState } from '../../../app.reducer';
import { SearchActions } from '../../actions/index';
import { CaseStatus, UnifiedSearchCase } from '../../search.interfaces';
import {
  SearchUnifiedCasesParams,
  UnifiedSearchService,
} from '../../services/unified-search.service';
import { SearchGuard } from '../search.guard';

describe('SearchGuard', () => {
  let guard: SearchGuard;
  let store: Store<AppState>;

  let navigate: jest.Mock;
  let searchCases: jest.Mock;

  beforeEach(() => {
    navigate = jest.fn();
    searchCases = jest.fn();

    TestBed.configureTestingModule({
      providers: [
        provideStore(),
        provideEffects([]),
        provideUsersGroupsStore(),
        SearchGuard,
        {
          provide: UnifiedSearchService,
          useValue: {
            searchCases,
          },
        },
        {
          provide: Router,
          useValue: {
            navigate,
          },
        },
      ],
    });

    guard = TestBed.inject<SearchGuard>(SearchGuard);
    store = TestBed.inject<Store<AppState>>(Store);

    jest.spyOn(store, 'dispatch');
  });

  const defaultQueryParams = {
    caseStatus: ['ACTIVE'] as CaseStatus[],
    applicationType: 'Appeal against grant of bail',
    caseReference: 'CASE_REFERENCE',
    hearingDateFrom: '2019-01-01',
    hearingDateTo: '2019-01-08',
    hearingTypeId: 'TYPE0001',
    partyAddress: 'PARTY_ADDRESS',
    partyDateOfBirth: '1990-01-01',
    partyFirstAndOrMiddleName: 'PARTY_FIRST_NAME',
    partyLastNameOrOrganisationName: 'PARTY_NAME',
    partyPostcode: 'PARTY_POSTCODE',
    partyTypes: 'APPLICANT,DEFENDANT',
    sjp: 'true',
    magistrateCourt: 'true',
    sortBySjpNoticeServed: 'asc',
    crownCourt: 'true',
    startFrom: '20',
    boxWorkHearing: 'true',
    boxWorkVirtualHearing: 'true',
  };

  const createActivatedRouteSnapshot = (
    queryParams: { [key: string]: string | CaseStatus[] } = {}
  ) => {
    const snapshot = new ActivatedRouteSnapshot();
    snapshot.queryParams = queryParams;
    return snapshot;
  };

  describe('when the user has no search permissions', () => {
    it('should resolve to false', () => {
      expect.assertions(2);

      const snapshot = createActivatedRouteSnapshot();
      const activate$ = guard.canActivate(snapshot);

      activate$.subscribe((didResolve) => {
        expect(didResolve).toBe(false);
        expect(navigate).toHaveBeenCalledWith(['/unauthorised-access']);
      });
    });
  });

  describe('when the user has search permissions', () => {
    beforeEach(() => {
      store.dispatch(
        UsersGroupsActions.setUserPermissions({
          permissions: [
            {
              object: 'CP Search',
              action: 'View',
            },
          ] as RolePermission[],
        })
      );
    });

    it('should resolve to true when there are no search parameters', () => {
      expect.assertions(2);

      const snapshot = createActivatedRouteSnapshot();
      const activate$ = guard.canActivate(snapshot);

      activate$.subscribe((didResolve) => {
        expect(didResolve).toBe(true);
        expect(store.dispatch).toHaveBeenCalledWith(
          SearchActions.resetSearch({ isBoxWorkHearing: false })
        );
      });
    });

    it('should ignore unrecognised search parameters', () => {
      expect.assertions(2);

      const snapshot = createActivatedRouteSnapshot({ unknown: '*' } as any);
      const activate$ = guard.canActivate(snapshot);

      activate$.subscribe((didResolve) => {
        expect(didResolve).toBe(true);
        expect(store.dispatch).toHaveBeenCalledWith(
          SearchActions.loadUnifiedSearchCasesSuccess({
            params: { pageSize: 10 },
            cases: [],
            totalResults: 0,
          })
        );
      });
    });

    it('should activate after searching the cases remotely', () => {
      expect.assertions(3);

      const snapshot = createActivatedRouteSnapshot(defaultQueryParams);
      const searchResult = {
        totalResults: 1,
        cases: [
          {
            caseId: '*',
          },
        ] as UnifiedSearchCase[],
      };
      searchCases.mockReturnValue(of(searchResult));

      guard.canActivate(snapshot).subscribe((didResolve) => {
        const params: SearchUnifiedCasesParams = {
          ...defaultQueryParams,
          sortBySjpNoticeServed:
            defaultQueryParams.sortBySjpNoticeServed as SearchUnifiedCasesParams['sortBySjpNoticeServed'],
          boxWorkHearing: true,
          boxWorkVirtualHearing: true,
          sjp: true,
          magistrateCourt: true,
          crownCourt: true,
          startFrom: 20,
          pageSize: 10,
        };

        expect(didResolve).toBe(true);
        expect(searchCases).toHaveBeenCalledWith({
          ...params,
          excludeCompletedApplications: true,
        });
        expect(store.dispatch).toHaveBeenCalledWith(
          SearchActions.loadUnifiedSearchCasesSuccess({ ...searchResult, params })
        );
      });
    });

    it('should ignore the `sortBySjpNoticeServed` when `sjp` is not true', () => {
      expect.assertions(1);

      const snapshot = createActivatedRouteSnapshot(omit(['sjp'], defaultQueryParams));
      searchCases.mockReturnValue(
        of({
          totalResults: 0,
          cases: [],
        })
      );
      guard.canActivate(snapshot).subscribe(() => {
        expect(searchCases.mock.calls[0][0].sortBySjpNoticeServed).toBeUndefined();
      });
    });

    it('should reject the activation when there is a search error', () => {
      expect.assertions(2);
      const error = new HttpErrorResponse({});
      const snapshot = createActivatedRouteSnapshot({ partyLastNameOrOrganisationName: '*' });
      searchCases.mockReturnValue(throwError(error));

      guard.canActivate(snapshot).subscribe((didResolve) => {
        expect(didResolve).toBe(false);
        expect(store.dispatch).toHaveBeenCalledWith(
          SearchActions.loadUnifiedSearchCasesError({ error })
        );
      });
    });
  });
});
