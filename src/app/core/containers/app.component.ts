import { Component, Inject } from '@angular/core';
import { ActivationStart, RouteConfigLoadEnd, RouteConfigLoadStart, Router } from '@angular/router';
import { HeaderNavItem } from '@cpp/application';
import { getUserHasPermission } from '@cpp/users-groups';
import { select, Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { debounceTime, filter, map, startWith } from 'rxjs/operators';
import { AppState, getAppConfig, getHasApiActivity } from '../../app.reducer';
import { EXPECTED_HOME_USER_PERMISSIONS, HomeUserPermissions } from '../../config';
import { AppLayoutComponent } from '../components/app-layout.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  template: `
    <app-layout
      [activity]="activity$ | async"
      [headerNavItems]="headerNavItems$ | async"
      [searchEnabled]="canSearch$ | async"
      (search)="handleSearch($event)"
    />
  `,
  imports: [AppLayoutComponent, AsyncPipe]
})
export class AppContainerComponent {
  accessibilityUrl$: Observable<string>;
  activity$: Observable<boolean>;
  canSearch$: Observable<boolean>;
  headerNavItems$: Observable<HeaderNavItem[]>;

  constructor(
    store: Store<AppState>,
    private router: Router,
    @Inject(EXPECTED_HOME_USER_PERMISSIONS) expectedPermissions: HomeUserPermissions
  ) {
    this.canSearch$ = store.pipe(select(getUserHasPermission([expectedPermissions.viewCpSearch])));

    this.headerNavItems$ = combineLatest([store.pipe(select(getAppConfig)), this.canSearch$]).pipe(
      map(([config, searchEnabled]) => {
        let navItems: HeaderNavItem[] = [];

        if (searchEnabled) {
          navItems = [
            {
              title: 'Detailed search',
              href: 'javascript:void(0)',
              onClick: () => {
                this.router.navigate(['/search'], { queryParams: {} });
              }
            }
          ];
        }
        if (config) {
          navItems = [
            ...navItems,
            {
              title: 'Home',
              href: config.appUrl
            },
            {
              title: 'Your account',
              href: config.idamProfilePage
            },
            {
              title: 'Your services',
              href: config.idamServicesPage
            },
            {
              title: 'Sign out',
              href: config.idamLogoutPage
            }
          ];
        }
        return navItems;
      })
    );

    this.activity$ = combineLatest([
      store.pipe(select(getHasApiActivity), debounceTime(1), startWith(false)),
      router.events.pipe(
        filter(
          event => event instanceof RouteConfigLoadStart || event instanceof RouteConfigLoadEnd
        ),
        map(event => !!(event instanceof RouteConfigLoadStart)),
        startWith(false)
      )
    ]).pipe(map(([hasApiActivity, isBeingLazyLoaded]) => hasApiActivity || isBeingLazyLoaded));

    router.events.pipe(filter(event => event instanceof ActivationStart)).subscribe(event => {
      if (
        (event as ActivationStart).snapshot.data &&
        (event as ActivationStart).snapshot.data.title
      ) {
        document.title = (event as ActivationStart).snapshot.data.title;
      } else {
        document.title = 'Common Platform Programme';
      }
    });

    this.accessibilityUrl$ = store.pipe(
      select(getAppConfig),
      map(config => `${config!.appUrl}/accessibility`)
    );
  }

  handleSearch(reference: string) {
    this.router.navigate(['/search'], { queryParams: { reference } });
  }
}
