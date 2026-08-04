import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CppHttp } from '@cpp/core';
import { map } from 'rxjs/operators';
import { CaseStatus, UnifiedSearchCase } from '../search.interfaces';

export interface SearchUnifiedCasesParams {
  caseStatus?: CaseStatus[];
  pageSize?: number;
  startFrom?: number;
  caseReference?: string;
  pncId?: string;
  partyTypes?: string;
  partyDateOfBirth?: string;
  partyFirstAndOrMiddleName?: string;
  partyLastNameOrOrganisationName?: string;
  partyAddress?: string;
  partyPostcode?: string;
  prosecutingAuthority?: string;
  hearingDateFrom?: string;
  hearingDateTo?: string;
  hearingTypeId?: string;
  sjp?: boolean;
  magistrateCourt?: boolean;
  crownCourt?: boolean;
  sortBySjpNoticeServed?: 'asc' | 'desc';
  sortByAppointmentDate?: 'asc' | 'desc';
  courtId?: string;
  applicationType?: string;
  boxWorkHearing?: boolean;
  boxWorkVirtualHearing?: boolean;
  excludeCompletedApplications?: boolean;
}

interface UnifiedSearchCaseResults {
  totalResults: number;
  cases: UnifiedSearchCase[];
}

@Injectable()
export class UnifiedSearchService {
  constructor(private http: CppHttp) {}

  searchCases(params: SearchUnifiedCasesParams) {
    return this.http
      .query<UnifiedSearchCaseResults>({
        url: '/unifiedsearchquery-query-api/query/api/rest/unifiedsearchquery/cases',
        requestType: 'application/vnd.unifiedsearch.query.cases+json',
        params: new HttpParams({
          fromObject: Object.keys(params)
            .filter(key => params[key as keyof SearchUnifiedCasesParams] !== undefined)
            .reduce(
              (queryParams, key) => ({
                ...queryParams,
                [key]: String(params[key as keyof SearchUnifiedCasesParams])
              }),
              {} as { [key: string]: string }
            )
        })
      })
      .pipe(map(patchMissingParties));
  }
}

const patchMissingParties = ({ totalResults, cases }: UnifiedSearchCaseResults) => ({
  totalResults,
  cases: cases.map(({ parties, ...rest }) => ({
    ...rest,
    parties: parties || []
  }))
});
