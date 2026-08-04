import { Action, createSelector } from '@ngrx/store';
import { AppState } from '../../app.reducer';
import { search, SearchState } from './search.reducer';

export interface State extends AppState {
  search: SearchState;
}

/** Provide reducer in AoT-compilation happy way */
export function searchFeatureReducer(state: SearchState | undefined, action: Action) {
  return search(state, action);
}

export const getSearchResult = (state: State) => state.search;

export const getSearchParams = createSelector(getSearchResult, result => {
  const { pageSize, startFrom, ...params } = result.params;

  return params;
});

export const getSearchMetadata = createSelector(getSearchResult, ({ totalResults, params }) => ({
  totalResults,
  pageSize: params && params.pageSize ? params.pageSize : 10,
  startFrom: params && params.startFrom ? params.startFrom : 0
}));

export const getSearchResults = createSelector(getSearchResult, ({ cases, params }) => {
  if (!!params.boxWorkHearing) {
    return cases.map(kase => {
      return {
        ...kase,
        hearings: (kase.hearings || []).filter(hearing => !!hearing.isBoxHearing)
      };
    });
  }
  return cases;
});
