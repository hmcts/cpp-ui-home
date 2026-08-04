import { Component, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  getApplicationTypes,
  getHearingTypes,
  getOrganisationUnits,
  getProsecutors,
  Prosecutor
} from '@cpp/reference-data';
import { getUserGroups } from '@cpp/users-groups';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, take, withLatestFrom } from 'rxjs/operators';
import { WofdWarningService } from '@cpp/application';
import { SearchActions } from '../actions';
import { SearchFormValues } from '../components/search-form.component';
import { getSearchMetadata, getSearchParams, getSearchResults, State } from '../reducers/index';
import { UnifiedSearchApplication, UnifiedSearchCase } from '../search.interfaces';
import { SearchUnifiedCasesParams } from '../services/unified-search.service';
import { SearchComponent } from '../components/search.component';
import { AsyncPipe } from '@angular/common';
import { REDIRECT_TOKEN } from '../../../main';

@Component({
  selector: 'app-search-container',
  template: `
    <app-search
      [breadcrumbs]="breadcrumbs"
      [initialFormValues]="initialFormValues$ | async"
      [pageSize]="pageSize$ | async"
      [startFrom]="startFrom$ | async"
      [totalResults]="totalResults$ | async"
      [results]="searchResults$ | async"
      (clearResults)="handleClearResults($event)"
      (postalReply)="handlePostalReply($event)"
      (search)="handleSearch($event)"
      (startFromChange)="handleStartFromChange($event)"
      (viewApplication)="handleViewApplication($event)"
      (viewSjpCase)="handleViewSjpCase($event)"
      (viewCrownCourtCase)="handleViewCrownCourtCase($event)"
      (viewApplicationAtAGlance)="handleViewApplicationAtAGlance($event)"
    />
  `,
  imports: [SearchComponent, AsyncPipe]
})
export class SearchContainerComponent {
  breadcrumbs = [
    {
      href: '/',
      label: 'Home',
      active: false
    },
    {
      href: null,
      label: 'Search',
      active: true
    }
  ];
  initialFormValues$: Observable<SearchFormValues | null>;
  startFrom$: Observable<number>;
  pageSize$: Observable<number>;
  searchResults$: Observable<UnifiedSearchCase[]>;
  totalResults$: Observable<number>;

  constructor(
    @Inject(REDIRECT_TOKEN)
    private redirectTo: (url: string) => void,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<State>,
    private wofdWarningService: WofdWarningService
  ) {
    const metadata$ = this.store.pipe(select(getSearchMetadata));

    this.initialFormValues$ = this.store.pipe(
      select(getSearchParams),
      withLatestFrom(this.store),
      map(([{ courtId, hearingTypeId, partyTypes, prosecutingAuthority, ...params }, state]) => ({
        ...params,
        caseStatus: params.caseStatus,
        applicationType: params.applicationType
          ? getApplicationTypes(state)!.find(({ type }) => type === params.applicationType)
          : undefined,
        hearingType: hearingTypeId
          ? getHearingTypes(state)!.find(({ id }) => id === hearingTypeId)
          : undefined,
        organisationUnit: courtId
          ? getOrganisationUnits(state)!.find(({ id }) => id === courtId)
          : undefined,
        partyTypes: partyTypes
          ? (partyTypes.split(',') as SearchFormValues['partyTypes'])
          : undefined,
        prosecutor: prosecutingAuthority
          ? getProsecutors(state)!.find(({ shortName }) => shortName === prosecutingAuthority) ||
            ({ shortName: prosecutingAuthority } as Prosecutor)
          : undefined
      }))
    );

    this.startFrom$ = metadata$.pipe(map(metadata => metadata.startFrom));
    this.pageSize$ = metadata$.pipe(map(metadata => metadata.pageSize));
    this.searchResults$ = this.store.pipe(select(getSearchResults));
    this.totalResults$ = metadata$.pipe(map(metadata => metadata.totalResults));
  }

  handleClearResults({ isBoxWorkHearing }: { isBoxWorkHearing: boolean }) {
    this.store.dispatch(SearchActions.resetSearch({ isBoxWorkHearing }));
  }

  handleSearch({
    applicationType,
    hearingType,
    organisationUnit,
    partyTypes,
    prosecutor,
    caseStatus,
    ...values
  }: SearchFormValues) {
    this.router.navigate(['.'], {
      relativeTo: this.route,
      queryParams: {
        ...values,
        // search using applicationType rather than applicationCode, see:
        // https://tools.hmcts.net/jira/projects/SCUS/issues/SCUS-134?filter=allopenissues
        applicationType: applicationType ? applicationType.type : undefined,
        courtId: organisationUnit ? organisationUnit.id : undefined,
        hearingTypeId: hearingType ? hearingType.id : undefined,
        partyTypes: partyTypes && partyTypes.length !== 0 ? partyTypes.join(',') : undefined,
        prosecutingAuthority: prosecutor ? prosecutor.shortName : undefined,
        caseStatus: caseStatus && caseStatus.length ? caseStatus : undefined
      } as SearchUnifiedCasesParams
    });
  }

  handleStartFromChange(startFrom: number) {
    this.store
      .pipe(
        select(getSearchParams),
        take(1),
        map(params => ({
          ...params,
          startFrom: startFrom !== 0 ? startFrom : undefined
        }))
      )
      .subscribe(queryParams => {
        this.router.navigate(['.'], { relativeTo: this.route, queryParams });
      });
  }

  handlePostalReply({ caseId }: UnifiedSearchCase) {
    // This is the handling for SJP postal replies when the new SJP UI goes live:
    this.store.pipe(select(getUserGroups), take(1)).subscribe(groups => {
      const role = groups!.find(group => group.groupName === 'Legal Advisers')
        ? 'legal-adviser'
        : 'court-admin';

      this.redirectTo(`/sjp/${role}/case-overview/${caseId}/postal-plea/add-change-plea`);
    });
  }

  handleViewApplication({ applications }: UnifiedSearchCase) {
    const appId = applications![0].applicationId;
    const url = `/prosecution-casefile/application-at-a-glance/${appId}`;
    const typesToCheck = applications!
      .filter(a => !!a.applicationTypeCode)
      .map(a => ({ code: a.applicationTypeCode! }));

    if (this.wofdWarningService.isWofdApplication(typesToCheck)) {
      this.wofdWarningService.showModal({
        onProceed: () => this.redirectTo(url)
      });
    } else {
      this.redirectTo(url);
    }
  }

  handleViewCrownCourtCase({ caseId }: UnifiedSearchCase) {
    this.redirectTo(`/prosecution-casefile/case-at-a-glance/${caseId}`);
  }

  handleViewSjpCase({ caseId }: UnifiedSearchCase) {
    // This is the handling for SJP cases when the new SJP UI goes live:
    this.store.pipe(select(getUserGroups), take(1)).subscribe(groups => {
      const role = groups!.find(group => group.groupName === 'Legal Advisers')
        ? 'legal-adviser'
        : 'court-admin';

      this.redirectTo(`/sjp/${role}/case-overview/${caseId}`);
    });
  }

  handleViewApplicationAtAGlance(application: UnifiedSearchApplication | undefined) {
    if (!application) {
      return;
    }

    const url = `/prosecution-casefile/application-at-a-glance/${application.applicationId}`;

    this.store.pipe(select(getApplicationTypes), take(1)).subscribe(appTypes => {
      const matchedType = (appTypes || []).find(at => at.type === application.applicationType);
      const typesToCheck = matchedType ? [matchedType] : [];

      if (this.wofdWarningService.isWofdApplication(typesToCheck)) {
        this.wofdWarningService.showModal({
          onProceed: () => this.redirectTo(url)
        });
      } else {
        this.redirectTo(url);
      }
    });
  }
}
