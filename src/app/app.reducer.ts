import { InjectionToken } from '@angular/core';
import { getUserRolePermissions, UsersGroupsState } from '@cpp/users-groups';
import { ReferenceDataState } from '@cpp/reference-data';
import { getRouterSelectors, routerReducer, RouterReducerState } from '@ngrx/router-store';
import { ActionReducerMap, createSelector } from '@ngrx/store';
import { configReducer, ConfigState } from './config/config.reducer';
import { apiReducer, ApiState } from './core/reducers/api.reducer';

interface RootState {
  api: ApiState;
  config: ConfigState;
  router: RouterReducerState;
}

export interface AppState extends ReferenceDataState, RootState, UsersGroupsState {}

export const reducers = new InjectionToken<ActionReducerMap<RootState>>('ROOT_REDUCER', {
  factory: () => ({
    api: apiReducer,
    config: configReducer,
    router: routerReducer,
  }),
});

export const getRouter = (state: AppState) => state.router;
export const getHasApiActivity = (state: AppState) => state.api.requests.length > 0;
export const getHasApiError = (state: AppState) => state.api.errors.length > 0;

export const getAppConfig = (state: AppState) => state.config.appConfig;

export const getUserCanSearch = createSelector(getUserRolePermissions, (userRolePermissions) =>
  (userRolePermissions || []).some(
    (permission) => (permission.object || '').toLowerCase() === 'cp search'
  )
);

const { selectQueryParam, selectUrl } = getRouterSelectors(getRouter);

export const getQueryParam = selectQueryParam;
export const getCurrentUrl = selectUrl;
