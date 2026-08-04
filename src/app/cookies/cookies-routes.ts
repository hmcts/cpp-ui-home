import { Routes } from '@angular/router';
import { CookiesComponent } from './cookies.component';

export const cookiesRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: CookiesComponent,
    data: {
      title: 'Cookie preferences',
    },
  },
];
