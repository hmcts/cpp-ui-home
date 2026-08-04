import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  output
} from '@angular/core';
import { UnifiedSearchApplication, UnifiedSearchCase } from '../search.interfaces';
import { SearchFormComponent, SearchFormValues } from './search-form.component';
import {
  PdkErrorSummaryComponent,
  PdkInsetTextComponent,
  PdkPaginationComponent,
  PdkCore,
  PdkGrid,
  ValidationError
} from '@cpp/pdk';
import { Breadcrumb, BreadcrumbsComponent } from '../../shared/components/breadcrumbs.component';
import { SearchResultApplicationComponent } from './search-result-application.component';
import { SearchResultCaseComponent } from './search-result-case.component';

@Component({
  selector: 'app-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <app-breadcrumbs [breadcrumbs]="breadcrumbs()" />
    <h1 pdk-typography="heading-xlarge">Search</h1>
    <pdk-grid container>
      <pdk-grid one-third>
        <app-search-form
          [initialValues]="initialFormValues()"
          (errors)="errors = $event"
          (resetForm)="handleResetForm($event)"
          (search)="search.emit($event)"
        />
      </pdk-grid>
      <pdk-grid two-thirds>
        @if (errors) {
        <pdk-error-summary [errors]="errors" focusOnChange />
        } @if (totalResults() === -1 && !errors) {
        <pdk-inset-text pdk-margin-top="0"> Use filters to make a search. </pdk-inset-text>
        } @if (totalResults() !== -1) {
        <pdk-inset-text pdk-margin-top="0">
          @if (totalResults() === 0) { There are no matching results. Try removing filters or
          double-checking your spelling. } @if (totalResults() > 0) {
          {{ totalResults() }} result{{ totalResults() !== 1 ? 's' : '' }}
          }
        </pdk-inset-text>
        } @for (result of results(); track result.caseReference) {
        <div data-test-id="search-result">
          @if (result.caseType === 'APPLICATION') {
          <app-search-result-application
            [result]="result"
            (viewApplication)="viewApplication.emit($event)"
          />
          } @if (result.caseType === 'PROSECUTION') {
          <app-search-result-case
            [result]="result"
            (postalReply)="postalReply.emit($event)"
            (viewCrownCourtCase)="viewCrownCourtCase.emit($event)"
            (viewSjpCase)="viewSjpCase.emit($event)"
            (viewApplicationAtAGlance)="viewApplicationAtAGlance.emit($event)"
          />
          }
        </div>
        } @if (totalResults() > pageSize()) {
        <pdk-pagination
          [currentPage]="currentPage"
          [maxPages]="10"
          (pageChange)="handlePageChange($event)"
          [pageSize]="pageSize()"
          [totalResults]="totalResults()"
        />
        }
      </pdk-grid>
    </pdk-grid>
  `,
  styleUrls: ['./search.scss'],
  imports: [
    PdkGrid,
    PdkCore,
    PdkInsetTextComponent,
    SearchFormComponent,
    BreadcrumbsComponent,
    SearchResultApplicationComponent,
    SearchResultCaseComponent,
    PdkPaginationComponent,
    PdkErrorSummaryComponent
  ]
})
export class SearchComponent {
  readonly breadcrumbs = input<Breadcrumb[]>([]);
  readonly initialFormValues = input<SearchFormValues>();
  readonly pageSize = input(10);
  readonly results = input<UnifiedSearchCase[]>([]);
  readonly startFrom = input(0);
  readonly totalResults = input(-1);
  readonly clearResults = output<{
    isBoxWorkHearing: boolean;
  }>();
  readonly postalReply = output<UnifiedSearchCase>();
  readonly search = output<SearchFormValues>();
  readonly startFromChange = output<number>();
  readonly viewApplication = output<UnifiedSearchCase>();
  readonly viewCrownCourtCase = output<UnifiedSearchCase>();
  readonly viewSjpCase = output<UnifiedSearchCase>();
  readonly viewApplicationAtAGlance = output<UnifiedSearchApplication | undefined>();

  errors?: ValidationError[] | null;

  get currentPage(): number {
    return this.startFrom() / this.pageSize() + 1;
  }

  handlePageChange(page: number) {
    this.startFromChange.emit((page - 1) * this.pageSize());
  }

  handleResetForm({ isBoxWorkHearing }: { isBoxWorkHearing: boolean }) {
    if (this.totalResults() !== -1) {
      this.clearResults.emit({ isBoxWorkHearing });
    }
  }
}
