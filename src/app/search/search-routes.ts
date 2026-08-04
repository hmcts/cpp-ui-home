import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  ApplicationTypesGuard,
  HearingTypesGuard,
  OrganisationUnitsGuard,
  ProsecutorsGuard,
} from '@cpp/reference-data';
import { SearchContainerComponent } from './containers/search.container';
import { SearchGuard } from './guards/search.guard';

export const searchRoutes: Routes = [
  {
    path: '',
    component: SearchContainerComponent,
    canActivate: [
      ApplicationTypesGuard,
      HearingTypesGuard,
      OrganisationUnitsGuard,
      ProsecutorsGuard,
      SearchGuard,
    ],
    runGuardsAndResolvers: 'always',
    data: {
      title: 'Search',
      referenceDataErrorRedirectTo: '/technical-error',
    },
  },
  // this is a fallback for external UIs that would redirect to /search/search
  {
    path: 'search',
    redirectTo: '',
  },
];
