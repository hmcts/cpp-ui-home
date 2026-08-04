import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorRouteState } from '@cpp/application';
import { Actions, createEffect } from '@ngrx/effects';
import { Action, select, Store } from '@ngrx/store';
import { filter, tap, withLatestFrom } from 'rxjs/operators';
import { AppState, getCurrentUrl } from '../../app.reducer';

interface ErrorAction extends Action {
  error?: HttpErrorResponse | any;
}

@Injectable()
export class RouterEffects {
  handleRouteError$ = createEffect(
    () =>
      this.actions$.pipe(
        filter((action) => !!action.error),
        withLatestFrom(this.store.pipe(select(getCurrentUrl))),
        tap(([{ error }, currentUrl]: [ErrorAction, string]) => {
          const state = {
            redirectUrl: currentUrl,
            errorPath: '/technical-error',
          } as ErrorRouteState;

          if (error!.status === 404) {
            state.errorPath = '/page-not-found';
          }
          if (error!.status === 401) {
            state.errorPath = '/signed-out-error';
          }
          this.router.navigate([state.errorPath], { state });
        })
      ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions<ErrorAction>,
    private router: Router,
    private store: Store<AppState>
  ) {}
}
