import { HttpParams } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { CppHttp } from '@cpp/core';
import { of } from 'rxjs';
import { UnifiedSearchService } from '../unified-search.service';
import { UnifiedSearchCase, UnifiedSearchParty } from '../../search.interfaces';

describe('UnifiedSearchService', () => {
  let service: UnifiedSearchService;
  let http: CppHttp;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UnifiedSearchService,
        {
          provide: CppHttp,
          useValue: {
            query: jest.fn(),
          },
        },
      ],
    });
    http = TestBed.inject<CppHttp>(CppHttp);
    service = TestBed.inject<UnifiedSearchService>(UnifiedSearchService);
  });

  describe('searchCases()', () => {
    it('should search for cases', () => {
      expect.assertions(2);

      const params = { caseReference: '*', pageSize: 10 };
      const body = {
        totalResults: 0,
        cases: [],
      };
      (http.query as jest.Mock).mockReturnValue(of(body));

      service.searchCases(params).subscribe((result) => {
        expect(result).toEqual(body);
        expect(http.query).toHaveBeenCalledWith({
          url: '/unifiedsearchquery-query-api/query/api/rest/unifiedsearchquery/cases',
          requestType: 'application/vnd.unifiedsearch.query.cases+json',
          params: new HttpParams({ fromObject: params as any }),
        });
      });
    });

    it('should patch any results that have missing `parties`', () => {
      expect.assertions(1);

      const params = { caseReference: '*', pageSize: 10 };
      const body = {
        totalResults: 0,
        cases: [
          {
            parties: [] as UnifiedSearchParty[],
          },
          {},
        ],
      };
      (http.query as jest.Mock).mockReturnValue(of(body));

      service.searchCases(params).subscribe((result) => {
        expect(result.cases).toEqual([
          { parties: [] as UnifiedSearchParty[] },
          { parties: [] as UnifiedSearchParty[] },
        ] as UnifiedSearchCase[]);
      });
    });
  });
});
