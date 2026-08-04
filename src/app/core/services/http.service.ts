import { inject, Injectable } from '@angular/core';
import {
  CppHttp,
  CppHttpBackend,
  GenerateUniqueKeyFn,
  HttpComandOptions,
  HttpCommandSyncOptions,
  HttpQueryOptions,
  NotificationDispatcher,
} from '@cpp/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AppState } from '../../app.reducer';
import { ApiActions } from '../actions';

// extend CppHttp so that we can spy on its requests

type HttpOptions = HttpQueryOptions | HttpComandOptions | HttpCommandSyncOptions;

@Injectable()
export class HomeHttp extends CppHttp {
  readonly store = inject(Store<AppState>);

  handleRequest(options: HttpOptions) {
    this.store.dispatch(ApiActions.pendingApiRequest({ request: options }));
  }

  handleResponse(options: HttpOptions) {
    return <R>(source$: Observable<R>): Observable<R> =>
      source$.pipe(
        finalize(() => {
          this.store.dispatch(ApiActions.completedApiRequest({ request: options }));
        })
      );
  }

  query<R>(options: HttpQueryOptions): Observable<R> {
    this.handleRequest(options);

    return super.query<R>(options).pipe(this.handleResponse(options));
  }

  command<R>(options: HttpComandOptions): Observable<R> {
    this.handleRequest(options);

    return super.command(options).pipe(this.handleResponse(options));
  }

  commandSync<R extends object = {}>(options: HttpCommandSyncOptions): Observable<R> {
    this.handleRequest(options);

    return super.commandSync<R>(options).pipe(this.handleResponse(options));
  }
}
