import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { CookiesPreferences, CookiesService } from '@cpp/core';
import { provideMockStore } from '@ngrx/store/testing';
import { CookiesComponent } from '../cookies.component';

describe('Cookies', () => {
  let fixture: ComponentFixture<CookiesComponent>;
  let getAllCookiePreferences: jest.Mock;
  let location: jest.Mock;
  let navigateByUrl: jest.Mock;
  let referrer: string;
  let restart: jest.Mock;
  let setAllCookiePreferences: jest.Mock;

  beforeEach(() => {
    getAllCookiePreferences = jest.fn();
    location = jest.fn();
    navigateByUrl = jest.fn();
    restart = jest.fn();
    setAllCookiePreferences = jest.fn();

    TestBed.configureTestingModule({
      providers: [
        provideMockStore({
          initialState: { config: { appConfig: { gaMeasurementId: 'TEST_MEASUREMENT_ID' } } }
        }),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) => (key === 'referrer' ? referrer : null)
              }
            }
          }
        },
        {
          provide: Router,
          useValue: {
            navigateByUrl
          }
        },
        {
          provide: CookiesService,
          useValue: {
            getAllCookiePreferences: (): CookiesPreferences => {
              return {
                realUserMonitoring: true
              };
            },
            restart,
            setAllCookiePreferences
          }
        }
      ]
    });
    fixture = TestBed.createComponent(CookiesComponent);
    fixture.detectChanges();
  });

  const mockWindowLocation = (queryMapMap: { referrer?: string } = {}) => {
    delete (global.window as Partial<Window>).location;
    referrer = queryMapMap.referrer!;
    window = Object.create(window);
    window.location = {
      set href(url: string) {
        location(url);
      }
    } as Location & string;
  };

  it('should compile correctly', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should set all cookie preferences when a referrer does not exist', () => {
    fixture.debugElement.query(By.css('button[type=submit]')).nativeElement.click();
    fixture.detectChanges();

    expect(setAllCookiePreferences).toHaveBeenCalledWith({ realUserMonitoring: true });
    expect(restart).toHaveBeenCalled();
    expect(navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('should set all cookie preferences when a referrer exists', () => {
    mockWindowLocation({ referrer: 'https://test.tld' });
    fixture.debugElement.query(By.css('button[type=submit]')).nativeElement.click();
    fixture.detectChanges();

    expect(setAllCookiePreferences).toHaveBeenCalledWith({ realUserMonitoring: true });
    expect(location).toHaveBeenCalledWith(referrer);
  });
});
