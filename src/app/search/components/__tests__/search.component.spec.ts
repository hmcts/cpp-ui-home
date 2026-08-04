/*eslint-disable @angular-eslint/prefer-standalone*/
import { Component, input, output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ValidationError } from '@cpp/pdk';

import { mockTwo } from '../../mocks/unified-search-cases.mock';
import { UnifiedSearchCase } from '../../search.interfaces';
import { SearchFormComponent, SearchFormValues } from '../search-form.component';
import { SearchComponent } from '../search.component';
import { Breadcrumb } from '../../../shared/components/breadcrumbs.component';
import { JsonPipe } from '@angular/common';
import { SearchResultCaseComponent } from '../search-result-case.component';
import { SearchResultApplicationComponent } from '../search-result-application.component';

describe('SearchComponent', () => {
  let fixture: ComponentFixture<SearchTestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SearchComponent],
      declarations: [SearchTestComponent],
    }).overrideComponent(SearchComponent, {
      remove: {
        imports: [SearchFormComponent, SearchResultCaseComponent, SearchResultApplicationComponent],
      },
      add: {
        imports: [
          SearchFormMockComponent,
          SearchResultCaseMockComponent,
          SearchResultApplicationMockComponent,
        ],
      },
    });

    fixture = TestBed.createComponent(SearchTestComponent);
    fixture.detectChanges();
  });

  it('should compile correctly when no search has taken place', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should compile correctly when a search returns no results', () => {
    fixture.componentInstance.totalResults = 0;
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should display validation errors from the form', () => {
    const formRef: SearchFormMockComponent = fixture.debugElement.query(
      By.directive(SearchFormMockComponent)
    ).componentInstance;
    formRef.errors.emit([{ id: '*', message: 'Error!' }]);
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should clear any existing results when a `resetForm` event is emitted by the form', () => {
    const formRef: SearchFormMockComponent = fixture.debugElement.query(
      By.directive(SearchFormMockComponent)
    ).componentInstance;
    formRef.resetForm.emit({ isBoxWorkHearing: false });
    expect(fixture.componentInstance.clearResults).not.toHaveBeenCalled();

    fixture.componentInstance.totalResults = 0;
    fixture.detectChanges();
    formRef.resetForm.emit({ isBoxWorkHearing: false });
    expect(fixture.componentInstance.clearResults).toHaveBeenCalled();
  });

  it('should propagate a `search` event from the form', () => {
    const formRef: SearchFormMockComponent = fixture.debugElement.query(
      By.directive(SearchFormMockComponent)
    ).componentInstance;
    formRef.search.emit({ caseReference: '!' });

    expect(fixture.componentInstance.search).toHaveBeenCalledWith({ caseReference: '!' });
  });

  describe('when application results exist', () => {
    beforeEach(() => {
      fixture.componentInstance.totalResults = 1;
      fixture.componentInstance.results = [
        { caseId: '*', caseType: 'APPLICATION' },
      ] as UnifiedSearchCase[];
      fixture.detectChanges();
    });

    it('should compile correctly', () => {
      expect(fixture).toMatchSnapshot();
    });

    it('should propagate an `viewApplication` event from a result', () => {
      const searchRef: SearchResultApplicationMockComponent = fixture.debugElement.query(
        By.directive(SearchResultApplicationMockComponent)
      ).componentInstance;
      searchRef.viewApplication.emit(mockTwo);

      expect(fixture.componentInstance.viewApplication).toHaveBeenCalledWith(mockTwo);
    });
  });

  describe('when case results exist', () => {
    beforeEach(() => {
      fixture.componentInstance.totalResults = 1;
      fixture.componentInstance.results = [
        { caseId: '*', caseType: 'PROSECUTION' },
      ] as UnifiedSearchCase[];
      fixture.detectChanges();
    });

    it('should compile correctly', () => {
      expect(fixture).toMatchSnapshot();
    });

    it('should propagate a `postalReply` event from a result', () => {
      const searchRef: SearchResultCaseMockComponent = fixture.debugElement.query(
        By.directive(SearchResultCaseMockComponent)
      ).componentInstance;
      searchRef.postalReply.emit(mockTwo);

      expect(fixture.componentInstance.postalReply).toHaveBeenCalledWith(mockTwo);
    });

    it('should propagate a `viewCrownCourtCase` event from a result', () => {
      const searchRef: SearchResultCaseMockComponent = fixture.debugElement.query(
        By.directive(SearchResultCaseMockComponent)
      ).componentInstance;
      searchRef.viewCrownCourtCase.emit(mockTwo);

      expect(fixture.componentInstance.viewCrownCourtCase).toHaveBeenCalledWith(mockTwo);
    });

    it('should propagate a `viewSjpCase` event from a result', () => {
      const searchRef: SearchResultCaseMockComponent = fixture.debugElement.query(
        By.directive(SearchResultCaseMockComponent)
      ).componentInstance;
      searchRef.viewSjpCase.emit(mockTwo);

      expect(fixture.componentInstance.viewSjpCase).toHaveBeenCalledWith(mockTwo);
    });

    it('should propagate a `viewApplicationAtAGlance` event from a result', () => {
      const searchRef: SearchResultCaseMockComponent = fixture.debugElement.query(
        By.directive(SearchResultCaseMockComponent)
      ).componentInstance;
      searchRef.viewApplicationAtAGlance.emit('mock-application-id');

      expect(fixture.componentInstance.viewApplicationAtAGlance).toHaveBeenCalledWith(
        'mock-application-id'
      );
    });
  });

  describe('when the the total results exceeds the page size', () => {
    beforeEach(() => {
      fixture.componentInstance.totalResults = 11;
      fixture.detectChanges();
    });

    it('should display the pagination', () => {
      expect(fixture).toMatchSnapshot();
    });

    it('should handle changing the page', () => {
      fixture.debugElement.query(By.css('[rel=Next]')).nativeElement.click();

      expect(fixture.componentInstance.startFromChange).toHaveBeenCalledWith(10);
    });
  });

  @Component({
    selector: 'app-search-test',
    template: `
      <app-search
        [breadcrumbs]="breadcrumbs"
        [initialFormValues]="initialFormValues"
        [pageSize]="pageSize"
        [results]="results"
        [startFrom]="startFrom"
        [totalResults]="totalResults"
        (clearResults)="clearResults($event)"
        (postalReply)="postalReply($event)"
        (search)="search($event)"
        (startFromChange)="startFromChange($event)"
        (viewApplication)="viewApplication($event)"
        (viewCrownCourtCase)="viewCrownCourtCase($event)"
        (viewSjpCase)="viewSjpCase($event)"
        (viewApplicationAtAGlance)="viewApplicationAtAGlance($event)"
      >
      </app-search>
    `,
    standalone: false,
  })
  class SearchTestComponent {
    breadcrumbs: Breadcrumb[] = [{ label: 'Home', href: '/' }];
    initialFormValues: SearchFormValues = { caseReference: '*' };
    pageSize = 10;
    results: UnifiedSearchCase[] = [];
    startFrom = 0;
    totalResults = -1;
    clearResults = jest.fn();
    postalReply = jest.fn();
    search = jest.fn();
    startFromChange = jest.fn();
    viewApplication = jest.fn();
    viewCrownCourtCase = jest.fn();
    viewSjpCase = jest.fn();
    viewApplicationAtAGlance = jest.fn();
  }

  @Component({
    selector: 'app-search-form',
    template: ` {{ initialValues() | json }} `,
    imports: [JsonPipe],
  })
  class SearchFormMockComponent {
    initialValues = input<SearchFormValues | undefined>(undefined);
    readonly errors = output<ValidationError[] | undefined>();
    readonly resetForm = output<{
      isBoxWorkHearing: boolean;
    }>();
    readonly search = output<SearchFormValues>();
  }

  @Component({
    selector: 'app-search-result-application',
    template: ` {{ result() | json }} `,
    imports: [JsonPipe],
  })
  class SearchResultApplicationMockComponent {
    result = input.required<UnifiedSearchCase>();
    readonly viewApplication = output<UnifiedSearchCase>();
  }

  @Component({
    selector: 'app-search-result-case',
    template: ` {{ result() | json }} `,
    imports: [JsonPipe],
  })
  class SearchResultCaseMockComponent {
    result = input.required<UnifiedSearchCase>();
    readonly postalReply = output<UnifiedSearchCase>();
    readonly viewCrownCourtCase = output<UnifiedSearchCase>();
    readonly viewSjpCase = output<UnifiedSearchCase>();
    readonly viewApplicationAtAGlance = output<string | undefined>();
  }
});
