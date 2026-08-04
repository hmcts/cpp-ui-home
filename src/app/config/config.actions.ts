import { HttpErrorResponse } from '@angular/common/http';
import { createAction, props } from '@ngrx/store';
import { AppConfig } from '../app.interfaces';

export const setAppConfiguration = createAction(
  'SET_APP_CONFIGURATION',
  props<{ appConfig: AppConfig }>()
);

export const setApplicationFailed = createAction(
  'SET_APPLICATION_FAILED',
  props<{ error: HttpErrorResponse }>()
);
