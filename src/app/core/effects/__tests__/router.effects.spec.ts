import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideMockActions } from '@ngrx/effects/testing';
import { SerializedRouterStateSnapshot, RouterReducerState } from '@ngrx/router-store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Observable, of } from 'rxjs';
import { AppState } from '../../../app.reducer';
import { ApiActions } from '../../actions';
import { RouterEffects } from '../router.effects';

describe('RouterEffects', () => {
  let effects: RouterEffects;
  let actions$: Observable<any>;
  let router: Router;
  let store: MockStore<AppState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RouterEffects,
        {
          provide: Router,
          useValue: {
            navigate: jest.fn(),
          },
        },
        provideMockActions(() => actions$),
        provideMockStore(),
      ],
    }).compileComponents();

    effects = TestBed.inject<RouterEffects>(RouterEffects);
    router = TestBed.inject<Router>(Router);
    store = TestBed.inject(MockStore);
    store.setState({
      router: {
        state: {
          url: '/test.com',
        } as SerializedRouterStateSnapshot,
      } as RouterReducerState<SerializedRouterStateSnapshot>,
    } as AppState);
  });

  describe('handleRouteError$', () => {
    describe('404 status', () => {
      it('should redirect to the not found page upon a 404 error', (done) => {
        actions$ = of(ApiActions.apiError({ error: { status: 404 } as any }));

        effects.handleRouteError$.subscribe(() => {
          expect(router.navigate).toHaveBeenCalledWith(['/page-not-found'], {
            state: {
              errorPath: '/page-not-found',
              redirectUrl: `/test.com`,
            },
          });
          done();
        });
      });
    });

    describe('401 status', () => {
      it('should redirect to the not found page upon a 401 error', (done) => {
        actions$ = of(ApiActions.apiError({ error: { status: 401 } as any }));

        effects.handleRouteError$.subscribe(() => {
          expect(router.navigate).toHaveBeenCalledWith(['/signed-out-error'], {
            state: {
              errorPath: '/signed-out-error',
              redirectUrl: `/test.com`,
            },
          });
          done();
        });
      });
    });
  });
});
