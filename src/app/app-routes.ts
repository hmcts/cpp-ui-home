import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  ERROR_PAGES_ROUTES,
  ERROR_ROUTE_PATHS,
  SYSTEM_ANNOUNCEMENT_ROUTES,
} from '@cpp/application';
import { UserPermissionsGuard } from '@cpp/users-groups';
import { ConfigGuard } from './config/config.guard';
import { AccessibilityComponent } from './core/components/accessibility.component';
import { TermsComponent } from './core/components/terms.component';
import { provideReferenceDataEnvironmentContext } from '@cpp/reference-data';
import { provideState } from '@ngrx/store';
import { searchFeatureReducer } from './search/reducers';
import { UnifiedSearchService } from './search/services/unified-search.service';
import { SearchGuard } from './search/guards/search.guard';
import { provideCppCookieServices } from '@cpp/core';

export const appRoutes: Routes = [
  {
    path: 'accessibility',
    component: AccessibilityComponent,
    pathMatch: 'full',
    data: {
      title: 'Accessibility',
    },
  },
  {
    path: 'terms-and-conditions',
    component: TermsComponent,
    pathMatch: 'full',
    data: {
      title: 'Terms and conditions',
    },
  },
  {
    path: '',
    canActivate: [ConfigGuard, UserPermissionsGuard],
    data: {
      userGroupsErrorRedirectTo: `/${ERROR_ROUTE_PATHS.technicalError}`,
      userPermissionsErrorRedirectTo: `/${ERROR_ROUTE_PATHS.technicalError}`,
      userNoPermissionsRedirectTo: `/${ERROR_ROUTE_PATHS.unauthorised}`,
      userServicesErrorRedirectTo: `/${ERROR_ROUTE_PATHS.unauthorised}`,
      serviceUnavailableRedirectTo: `/${ERROR_ROUTE_PATHS.serviceUnavailable}`,
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadChildren: () => import('./home/home-routes').then((m) => m.homeRoutes),
      },
      {
        path: 'cookies',
        providers: [provideCppCookieServices()],
        pathMatch: 'full',
        loadChildren: () => import('./cookies/cookies-routes').then((m) => m.cookiesRoutes),
      },
      {
        path: 'search',
        providers: [
          SearchGuard,
          provideState('search', searchFeatureReducer),
          provideReferenceDataEnvironmentContext(),
          UnifiedSearchService,
        ],
        loadChildren: () => import('./search/search-routes').then((m) => m.searchRoutes),
      },
    ],
  },
  ...SYSTEM_ANNOUNCEMENT_ROUTES,
  ...ERROR_PAGES_ROUTES,
];
