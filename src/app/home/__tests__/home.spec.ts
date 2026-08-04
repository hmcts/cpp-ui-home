import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideUsersGroupsStore, UserService, UsersGroupsActions } from '@cpp/users-groups';
import { provideStore, Store } from '@ngrx/store';
import { AppState, reducers } from '../../app.reducer';
import { HomeContainerComponent } from '../home.container';
import { provideEffects } from '@ngrx/effects';

describe('HomeContainerComponent', () => {
  let fixture: ComponentFixture<HomeContainerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideStore(reducers, { runtimeChecks: {} }),
        provideEffects([]),
        provideUsersGroupsStore(),
      ],
    });

    const store: Store<AppState> = TestBed.inject(Store);

    store.dispatch(
      UsersGroupsActions.setUserServices({
        userServices: [
          {
            name: 'Single Justice Procedure',
            containsSearch: false,
            features: [
              {
                key: 'sjp-startSession',
                title: 'Start a new SJP session',
                type: 'LINK',
              },
              {
                key: 'courtAdmin-registerMedia',
                title: 'Create media register',
                type: 'LINK',
              },
            ],
          },
          {
            name: 'Court proceedings',
            containsSearch: true,
            features: [
              {
                key: 'hearing-list',
                title: 'View list and record decisions',
                type: 'LINK',
              },
              {
                key: 'prosecution-caseFile-search',
                title: 'Search',
                type: 'SEARCH',
              },
            ],
          },
          {
            name: 'Search',
            containsSearch: true,
            features: [
              {
                key: 'hearing-list',
                title: 'View list and record decisions',
                type: 'SEARCH',
              },
            ],
          },
        ] as UserService[],
      })
    );
    fixture = TestBed.createComponent(HomeContainerComponent);
    fixture.detectChanges();
  });

  it('should compile correctly', () => {
    expect(fixture).toMatchSnapshot();
  });
});
