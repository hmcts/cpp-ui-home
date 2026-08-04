import {
  importProvidersFrom,
  inject,
  InjectionToken,
  provideAppInitializer,
  provideZoneChangeDetection
} from '@angular/core';

import { environment } from './environments/environment';
import { bootstrapApplication, provideProtractorTestingSupport } from '@angular/platform-browser';
import { provideEffects } from '@ngrx/effects';
import { appRoutes } from './app/app-routes';
import { provideUserGroupsEnvironmentContext } from '@cpp/users-groups';
import { provideStore } from '@ngrx/store';
import { reducers } from './app/app.reducer';
import { provideCPPApplicationEnvironment } from '@cpp/application';
import { RouterState, provideRouterStore } from '@ngrx/router-store';
import { AppContainerComponent } from './app/core/containers/app.component';
import { ConfigService } from './app/config';
import { provideCppCoreHttpServices, withCppHttpOverrides } from '@cpp/core';
import { provideRouter, withInMemoryScrolling, withRouterConfig } from '@angular/router';
import { RouterEffects } from './app/core/effects/router.effects';
import { HomeHttp } from './app/core/services/http.service';

export const REDIRECT_TOKEN = new InjectionToken<(url: string) => void>('InjectionToken');

export function redirect(url: string) {
  window.location.href = url;
}

bootstrapApplication(AppContainerComponent, {
  providers: [
    provideProtractorTestingSupport(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAppInitializer(async () => {
      const initializerFn = (
        (appConfig: ConfigService) => async () =>
          await appConfig.load()
      )(inject(ConfigService));
      return await initializerFn();
    }),
    provideStore(reducers, {
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true
      }
    }),
    provideEffects([RouterEffects]),
    provideRouterStore({ routerState: RouterState.Minimal }),
    provideCppCoreHttpServices(withCppHttpOverrides(ConfigService, HomeHttp)),
    provideUserGroupsEnvironmentContext(),
    provideRouter(
      appRoutes,
      withRouterConfig({
        onSameUrlNavigation: 'reload',
        paramsInheritanceStrategy: 'always',
        urlUpdateStrategy: 'eager'
      }),
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled'
      })
    ),
    provideCPPApplicationEnvironment(environment),

    ...environment.providers,
    {
      provide: REDIRECT_TOKEN,
      useValue: redirect
    }
  ]
}).catch(err => console.error(err));
