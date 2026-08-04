import { HttpErrorResponse } from '@angular/common/http';
import { createReducer, on } from '@ngrx/store';
import { ApiActions, RequestOptions } from '../actions';

export interface ApiState {
  requests: RequestOptions[];
  errors: HttpErrorResponse[];
}

const initialState: ApiState = {
  requests: [],
  errors: []
};

export const apiReducer = createReducer(
  initialState,
  on(ApiActions.pendingApiRequest, (state, { request }) => ({
    ...state,
    requests: [...state.requests, request]
  })),
  on(ApiActions.completedApiRequest, (state, { request }) => ({
    ...state,
    requests: state.requests.filter(req => req !== request)
  })),
  on(ApiActions.apiError, (state, { error }) => ({
    ...state,
    errors: [...state.errors, error]
  }))
);
