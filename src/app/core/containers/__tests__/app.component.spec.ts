import { CommonModule, JsonPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  ActivatedRouteSnapshot,
  ActivationStart,
  Event,
  provideRouter,
  Router,
} from '@angular/router';
import { provideCPPApplicationEnvironment } from '@cpp/application';
import { HeaderNavItem } from '@cpp/application';
import { provideCppCoreHttpServices } from '@cpp/core';
import {
  UsersGroupsActions,
  RolePermission,
  provideUserGroupsEnvironmentContext,
} from '@cpp/users-groups';
import { provideEffects } from '@ngrx/effects';
import { provideStore, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { AppState, reducers } from '../../../app.reducer';
import { setAppConfiguration } from '../../../config/config.actions';
import { ApiActions } from '../../actions';
import { AppContainerComponent } from '../app.component';
import { AppLayoutComponent } from '../../components/app-layout.component';

describe('AppContainerComponent', () => {
  let fixture: ComponentFixture<AppContainerComponent>;
  let router: Router;
  let store: Store<AppState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule],
      providers: [
        provideRouter([]),
        provideStore(reducers, { runtimeChecks: {} }),
        provideUserGroupsEnvironmentContext(),
        provideCPPApplicationEnvironment({ production: false }),
        provideEffects([]),
        provideCppCoreHttpServices(),
      ],
    })
      .overrideComponent(AppContainerComponent, {
        remove: {
          imports: [AppLayoutComponent],
        },
        add: {
          imports: [AppLayoutMockComponent],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AppContainerComponent);
    router = TestBed.inject(Router);
    store = TestBed.inject(Store);
    store.dispatch(
      setAppConfiguration({
        appConfig: {
          appUrl: 'http://app.url',
          apiRoot: '*',
          idamLogoutPage: '/logout',
          idamServicesPage: '/services',
          idamProfilePage: '/profile',
        },
      })
    );

    router.navigate = jest.fn();
  });

  it('should compile correctly', () => {
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should show the activity indicator when perform an api request', fakeAsync(() => {
    fixture.detectChanges();
    store.dispatch(ApiActions.pendingApiRequest({ request: { url: '/search' } as any }));
    tick(1);
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  }));

  it('should set the page title when specified by the activated route', () => {
    const snapshot = new ActivatedRouteSnapshot();
    snapshot.data = { title: 'Page title' };
    (router.events as Subject<Event>).next(new ActivationStart(snapshot));

    expect(document.title).toEqual('Page title');
  });

  it('should default to a standard page title when not specified by the activated route', () => {
    const snapshot = new ActivatedRouteSnapshot();
    (router.events as Subject<Event>).next(new ActivationStart(snapshot));

    expect(document.title).toEqual('Common Platform Programme');
  });

  it('should enable the search when the user has sufficient permissions', () => {
    store.dispatch(
      UsersGroupsActions.setUserPermissions({
        permissions: [
          {
            object: 'CP Search',
            action: 'View',
          },
        ] as RolePermission[],
      })
    );

    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should handle a `search` event', () => {
    fixture.debugElement
      .query(By.directive(AppLayoutMockComponent))
      .componentInstance.search.emit('*');

    expect(router.navigate).toHaveBeenCalledWith(['/search'], {
      queryParams: { caseReference: '*' },
    });
  });
});

@Component({
  selector: 'app-layout',
  template: `
    activity: {{ activity() }}
    <br />
    headerNavItems: {{ headerNavItems() | json }}
    <br />
    searchEnabled: {{ searchEnabled() ? 'Yes' : 'No' }}
  `,
  imports: [JsonPipe],
})
class AppLayoutMockComponent {
  activity = input(false);
  headerNavItems = input<HeaderNavItem[]>([]);
  searchEnabled = input(false);
  search = output<string>();
}
