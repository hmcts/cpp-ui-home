import { HttpErrorResponse } from '@angular/common/http';
import { createAction, props } from '@ngrx/store';
import { UnifiedSearchCase } from '../search.interfaces';
import { SearchUnifiedCasesParams } from '../services/unified-search.service';

export const loadUnifiedSearchCasesSuccess = createAction(
  'LOAD_UNIFIED_SEARCH_CASES_SUCCESS',
  props<{
    params: SearchUnifiedCasesParams;
    totalResults: number;
    cases: UnifiedSearchCase[];
  }>()
);

export const loadUnifiedSearchCasesError = createAction(
  'LOAD_UNIFIED_SEARCH_CASES_ERROR',
  props<{ error: HttpErrorResponse }>()
);

export const resetSearch = createAction(
  'RESET_UNIFIED_CASES',
  props<{ isBoxWorkHearing: boolean }>()
);
