import { HttpErrorResponse } from '@angular/common/http';
import { createReducer, on } from '@ngrx/store';
import { AppConfig } from '../app.interfaces';
import { setAppConfiguration, setApplicationFailed } from './config.actions';

export interface ConfigState {
  appFailedError: HttpErrorResponse | null;
  appConfig: AppConfig | null;
}

const initialState: ConfigState = {
  appConfig: null,
  appFailedError: null
};

export const configReducer = createReducer(
  initialState,
  on(setAppConfiguration, (state, { appConfig }) => ({
    ...state,
    appConfig
  })),
  on(setApplicationFailed, (state, { error }) => ({
    ...state,
    error
  }))
);
