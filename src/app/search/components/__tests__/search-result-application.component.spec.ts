/*eslint-disable @angular-eslint/prefer-standalone*/
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import * as lolex from 'lolex';
import { mockFive } from '../../mocks/unified-search-cases.mock';
import { SearchResultApplicationComponent } from '../search-result-application.component';
import { UnifiedSearchCase } from '../../search.interfaces';

describe('SearchResultApplicationComponent', () => {
  let fixture: ComponentFixture<SearchResultApplicationTestComponent>;

  beforeEach(() => {
    lolex.install({ now: new Date(2020, 0, 1) });
    jest.useFakeTimers();

    TestBed.configureTestingModule({
      imports: [SearchResultApplicationComponent],
      declarations: [SearchResultApplicationTestComponent],
    });

    fixture = TestBed.createComponent(SearchResultApplicationTestComponent);
    fixture.detectChanges();
  });

  it('should compile correctly', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should display an overdue alert when a boxwork application is overdue', () => {
    // boxwork and not overdue
    fixture.componentInstance.result = {
      ...mockFive,
      hearings: [
        {
          isBoxHearing: true,
          boxWorkTaskStatus: 'IN_PROGRESS',
          hearingDates: ['2020-01-01'],
        },
      ],
      applications: [
        {
          applicationId: '*',
          applicationReference: '*',
          applicationType: '*',
        },
      ],
    } as UnifiedSearchCase;
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();

    // not boxwork and overdue
    fixture.componentInstance.result = {
      ...mockFive,
      hearings: [
        {
          isBoxHearing: false,
        },
      ],
      applications: [
        {
          applicationId: '*',
          applicationReference: '*',
          applicationType: '*',
          dueDate: '2019-12-31',
        },
      ],
    } as UnifiedSearchCase;
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();

    // boxwork and received
    fixture.componentInstance.result = {
      ...mockFive,
      hearings: [
        {
          isBoxHearing: true,
          boxWorkTaskStatus: 'COMPLETE',
          hearingDates: ['2020-01-01'],
        },
      ],
      applications: [
        {
          applicationId: '*',
          applicationReference: '*',
          applicationType: '*',
        },
      ],
    } as UnifiedSearchCase;
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();

    // boxwork and timed appointments
    fixture.componentInstance.result = {
      ...mockFive,
      hearings: [
        {
          isBoxHearing: true,
          isVirtualBoxHearing: true,
          boxWorkTaskStatus: 'COMPLETE',
          hearingDates: ['2019-01-22'],
          hearingDays: [
            {
              sittingDay: '2019-01-22T10:00:00Z',
              listingSequence: 1,
              listedDurationMinutes: 60,
            },
          ],
        },
      ],
      applications: [
        {
          applicationId: '*',
          applicationReference: '*',
          applicationType: '*',
        },
      ],
    } as UnifiedSearchCase;
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should emit a `viewApplication` event when viewing the application', () => {
    fixture.debugElement.query(By.css('[data-test-id="view-application"]')).nativeElement.click();

    expect(fixture.componentInstance.viewApplication).toHaveBeenCalledWith(mockFive);
  });

  it('should display the view application link when applicationId exists', () => {
    fixture.componentInstance.result = {
      ...mockFive,
      applications: [
        {
          applicationId: '64f1b230-d755-4157-9eb3-622cef304293',
          applicationReference: 'IZCHPZYTMH',
          applicationType: 'Application for an extension of warrant for further detention',
        },
      ],
    } as UnifiedSearchCase;
    fixture.detectChanges();

    const link = fixture.debugElement.query(By.css('[data-test-id="view-application"]'));
    expect(link).toBeTruthy();
  });

  it('should not display the view application link when applicationId is missing', () => {
    fixture.componentInstance.result = {
      ...mockFive,
      applications: [
        {
          applicationReference: 'IZCHPZYTMH',
          applicationType: 'Application for an extension of warrant for further detention',
        },
      ],
    } as UnifiedSearchCase;
    fixture.detectChanges();

    const link = fixture.debugElement.query(By.css('[data-test-id="view-application"]'));
    expect(link).toBeNull();
  });

  @Component({
    selector: 'app-search-result-application-test',
    template: `
      <app-search-result-application [result]="result" (viewApplication)="viewApplication($event)">
      </app-search-result-application>
    `,
    standalone: false,
  })
  class SearchResultApplicationTestComponent {
    result: UnifiedSearchCase = mockFive;
    viewApplication = jest.fn();
  }
});
