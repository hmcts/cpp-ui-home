import { RolePermission } from '@cpp/users-groups';
import { InjectionToken } from '@angular/core';

export interface HomeUserPermissions<T = Pick<RolePermission, 'object' | 'action'>> {
  viewCpSearch: T;
}

/**
 * An injection token to hold all expected permissions for this hearing context users. Use this token
 * by simply injecting it into a component where necessary.
 * Update this token with additional permissions as per requirement.
 */
export const EXPECTED_HOME_USER_PERMISSIONS = new InjectionToken<HomeUserPermissions>(
  'User Permissions',
  {
    providedIn: 'root',
    factory: () => ({
      viewCpSearch: {
        object: 'CP Search',
        action: 'View'
      }
    })
  }
);
