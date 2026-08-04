/*eslint-disable @angular-eslint/prefer-standalone*/
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SystemAnnouncementsService } from '@cpp/users-groups';
import { BehaviorSubject, of } from 'rxjs';
import { AppLayoutComponent } from '../app-layout.component';
import { provideRouter } from '@angular/router';
import { provideCPPApplicationEnvironment } from '@cpp/application';
import { BreakpointObserver } from '@angular/cdk/layout';

describe('AppLayoutComponent', () => {
  let fixture: ComponentFixture<AppLayoutTestComponent>;
  let observe: jest.Mock;
  const mockSubject = new BehaviorSubject<{ matches: boolean }>({ matches: true });

  beforeEach(() => {
    observe = jest.fn(() => mockSubject);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideCPPApplicationEnvironment({ production: false }),
        {
          provide: SystemAnnouncementsService,
          useValue: {
            getSystemAnnouncements: jest.fn().mockReturnValue(of([])),
          },
        },
        {
          provide: BreakpointObserver,
          useValue: { observe },
        },
      ],
      imports: [AppLayoutComponent],
      declarations: [AppLayoutTestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppLayoutTestComponent);
    fixture.detectChanges();
  });

  it('should compile correctly', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should compile correctly when activity exists', () => {
    fixture.componentInstance.activity = true;
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should compile correctly when search is enabled', () => {
    fixture.componentInstance.searchEnabled = true;
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  @Component({
    selector: 'app-layout-test',
    template: `
      <app-layout
        [activity]="activity"
        [headerNavItems]="headerNavItems"
        [searchEnabled]="searchEnabled"
      >
      </app-layout>
    `,
    standalone: false,
  })
  class AppLayoutTestComponent {
    activity = false;
    headerNavItems = [
      {
        title: 'Your account',
        href: '/account',
      },
      {
        title: 'Sign out',
        href: '/logout',
      },
    ];
    searchEnabled = false;
  }
});
