import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, mapTo, switchMap, take, tap } from 'rxjs/operators';
import { AppState } from '../../app.reducer';
import { SearchActions } from '../actions';
import { SearchUnifiedCasesParams, UnifiedSearchService } from '../services/unified-search.service';
import { parseFormValues } from '../../core/util/form';
import { getUserHasPermission } from '@cpp/users-groups';
import { EXPECTED_HOME_USER_PERMISSIONS, HomeUserPermissions } from '../../config';

@Injectable()
export class SearchGuard {
  constructor(
    private router: Router,
    private store: Store<AppState>,
    private unifiedSearch: UnifiedSearchService,
    @Inject(EXPECTED_HOME_USER_PERMISSIONS) private expectedPermissions: HomeUserPermissions
  ) {}

  searchWithParams(q: { [key: string]: any }) {
    const parseTrue = (value: string) => (value === 'true' ? true : undefined);
    const boxWorkHearing = parseTrue(q.boxWorkHearing);
    const boxWorkVirtualHearing = parseTrue(q.boxWorkVirtualHearing);

    const rawParams: SearchUnifiedCasesParams = {
      caseStatus: q.caseStatus,
      applicationType: q.applicationType,
      caseReference: q.caseReference,
      courtId: q.courtId,
      hearingDateFrom: q.hearingDateFrom,
      hearingDateTo: q.hearingDateTo,
      hearingTypeId: q.hearingTypeId,
      partyFirstAndOrMiddleName: q.partyFirstAndOrMiddleName,
      partyLastNameOrOrganisationName: q.partyLastNameOrOrganisationName,
      partyAddress: q.partyAddress,
      partyDateOfBirth: q.partyDateOfBirth,
      partyTypes: q.partyTypes,
      partyPostcode: q.partyPostcode,
      prosecutingAuthority: q.prosecutingAuthority,
      sjp: parseTrue(q.sjp),
      magistrateCourt: parseTrue(q.magistrateCourt),
      crownCourt: parseTrue(q.crownCourt),
      sortBySjpNoticeServed:
        parseTrue(q.sjp) && q.sortBySjpNoticeServed
          ? (q.sortBySjpNoticeServed as SearchUnifiedCasesParams['sortBySjpNoticeServed'])
          : undefined,
      sortByAppointmentDate:
        parseTrue(q.boxWorkHearing) && !q.sortBySjpNoticeServed ? 'asc' : undefined,
      startFrom: q.startFrom ? Number(q.startFrom) : undefined,
      boxWorkHearing,
      boxWorkVirtualHearing,
      excludeCompletedApplications: boxWorkHearing ? true : undefined,
    };
    const filteredParams = parseFormValues(rawParams);

    if (Object.keys(filteredParams).length > 0) {
      const params = { ...filteredParams, pageSize: 10 } as SearchUnifiedCasesParams;

      return this.unifiedSearch.searchCases(params).pipe(
        tap((result) =>
          this.store.dispatch(SearchActions.loadUnifiedSearchCasesSuccess({ params, ...result }))
        ),
        mapTo(true),
        catchError((error) => {
          this.store.dispatch(SearchActions.loadUnifiedSearchCasesError({ error }));
          return of(false);
        })
      );
    }
    this.store.dispatch(
      SearchActions.resetSearch({ isBoxWorkHearing: !!filteredParams.boxWorkHearing })
    );

    return of(true);
  }

  canActivate({ queryParams }: ActivatedRouteSnapshot) {
    return this.store.pipe(
      map(getUserHasPermission([this.expectedPermissions.viewCpSearch])),
      tap((canActivate) => {
        if (!canActivate) {
          this.router.navigate(['/unauthorised-access']);
        }
      }),
      take(1),
      switchMap((canSearch) => (canSearch ? this.searchWithParams(queryParams) : of(false)))
    );
  }
}
