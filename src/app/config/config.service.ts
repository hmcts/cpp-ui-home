import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { CppHttpConfig } from '@cpp/core';
import { Store } from '@ngrx/store';
import { tap } from 'rxjs/operators';
import { AppConfig } from '../app.interfaces';
import { AppState } from '../app.reducer';
import { setAppConfiguration, setApplicationFailed } from './config.actions';

// AppConfigService can be used as the provider for all configuration
// dependencies required by submodules, so long as it implements their
// interfaces

@Injectable({ providedIn: 'root' })
export class ConfigService implements CppHttpConfig {
  baseUrl!: string;

  constructor(private http: HttpClient, private store: Store<AppState>) {}

  load() {
    return new Promise((resolve) => {
      this.http
        .get<AppConfig>('./app.override.config.json')
        .pipe(
          tap({
            next: (appConfig) => {
              this.baseUrl = appConfig.apiRoot;
              this.store.dispatch(setAppConfiguration({ appConfig }));
            },
            error: (error) => {
              this.store.dispatch(setApplicationFailed({ error }));
            },
          })
        )
        .subscribe(resolve, resolve);
    });
  }
}
