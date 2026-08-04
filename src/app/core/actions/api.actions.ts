import { HttpComandOptions, HttpCommandSyncOptions, HttpQueryOptions } from '@cpp/core';
import { createAction, props } from '@ngrx/store';
import { HttpErrorResponse } from '@angular/common/http';

export type RequestOptions = HttpQueryOptions | HttpComandOptions | HttpCommandSyncOptions;

export const pendingApiRequest = createAction('API_REQUEST', props<{ request: RequestOptions }>());

export const completedApiRequest = createAction(
  'API_RESPONSE',
  props<{ request: RequestOptions }>()
);

export const apiError = createAction('API_ERROR', props<{ error: HttpErrorResponse }>());
