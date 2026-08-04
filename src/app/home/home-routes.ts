import { Routes } from '@angular/router';
import { UserService, UserServiceExistsGuard, UserServicesGuard } from '@cpp/users-groups';
import { HomeContainerComponent } from './home.container';

export const homeRoutes: Routes = [
  {
    path: '',
    component: HomeContainerComponent,
    canActivate: [UserServicesGuard, UserServiceExistsGuard],
    data: {
      title: 'Home',
      userServiceExistsPredicate,
      userServiceExistsErrorRedirectTo: '/unauthorised-access',
    },
  },
];

export function userServiceExistsPredicate(services: UserService[]) {
  return services.length > 0;
}
