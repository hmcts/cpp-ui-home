import { createReducer, on } from '@ngrx/store';
import { SearchActions } from '../actions/index';
import { UnifiedSearchCase } from '../search.interfaces';
import { SearchUnifiedCasesParams } from '../services/unified-search.service';

export interface SearchState {
  params: SearchUnifiedCasesParams;
  totalResults: number;
  cases: UnifiedSearchCase[];
}

const initialState: SearchState = {
  params: { pageSize: 0 },
  totalResults: -1,
  cases: []
};

export const search = createReducer(
  initialState,
  on(SearchActions.loadUnifiedSearchCasesSuccess, (_, { totalResults, cases, params }) => ({
    params,
    totalResults,
    cases
  })),
  on(SearchActions.resetSearch, (_, { isBoxWorkHearing }) => {
    return {
      ...initialState,
      params: {
        ...initialState.params,
        boxWorkHearing: isBoxWorkHearing
      }
    };
  })
);
