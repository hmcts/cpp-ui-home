import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  generateId,
  PdkDetailsComponent,
  PdkDetailsDirective,
  PdkDetailsSummaryComponent,
  PdkInsetTextComponent,
  PdkCore
} from '@cpp/pdk';
import { format, isBefore } from 'date-fns';
import { sort } from 'ramda';
import {
  ApplicationStatus,
  UnifiedSearchApplication,
  UnifiedSearchCase,
  UnifiedSearchCaseStatus,
  UnifiedSearchHearing,
  UnifiedSearchParty
} from '../search.interfaces';

import { DisplayNamePipe } from '../../shared/pipes/display-name.pipe';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-search-result-case',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="app-search-result" pdk-margin-bottom="5" pdk-border-colour="mid-grey">
      <header
        class="app-search-result__header"
        pdk-fill-colour="light-grey"
        pdk-padding-top="2"
        pdk-padding-bottom="1"
        pdk-padding-horizontal="6"
      >
        <button
          class="app-search-result__toggle"
          pdk-margin-bottom="1"
          pdk-padding-left="4"
          pdk-text-colour="blue"
          pdk-text-hover-colour="dark-blue"
          pdk-typography="body-medium"
          pdk-focusable
          [class.app-search-result__toggle--open]="contentExpanded"
          [attr.id]="summaryId"
          [attr.aria-controls]="contentId"
          [attr.aria-expanded]="contentExpanded"
          (click)="contentExpanded = !contentExpanded"
        >
          <span class="app-search-result__toggle-text">{{ result().caseReference }}</span>
        </button>
        @if (result().sjp) {
        <a
          class="app-search-result__header-link"
          pdk-margin-left="6"
          data-test-id="view-sjp-case"
          pdk-link
          href="javascript:void(0)"
          (click)="viewSjpCase.emit(result())"
          >View SJP case</a
        >
        } @if (result().crownCourt || result().magistrateCourt || TO_DEPRECATE_isSpiCase) {
        <a
          class="app-search-result__header-link"
          pdk-margin-left="6"
          data-test-id="view-crown-court-case"
          pdk-link
          href="javascript:void(0)"
          (click)="viewCrownCourtCase.emit(result())"
          >View case</a
        >
        }
      </header>
      <div pdk-padding-horizontal="6">
        @if (result().sourceSystemReference) {
        <p pdk-text-colour="dark-grey">
          This case has been migrated. Reference: {{ result().sourceSystemReference }}
        </p>
        } @if (result().parties.length > 1) {
        <button
          pdk-margin-top="2"
          pdk-margin-bottom="0"
          pdk-padding-left="4"
          pdk-text-colour="blue"
          pdk-text-hover-colour="dark-blue"
          pdk-focusable
          class="app-search-result__toggle"
          [class.app-search-result__toggle--open]="addressesExpanded"
          [attr.id]="addressId"
          [attr.aria-controls]="addressIds"
          [attr.aria-expanded]="addressesExpanded"
          (click)="addressesExpanded = !addressesExpanded"
        >
          <span class="app-search-result__toggle-text">View addresses</span>
        </button>
        }
        <div aria-label="Parties">
          @for (party of result().parties; let i = $index; track i;) {
          <dl>
            <div class="app-search-result__row">
              <div pdk-margin-right="2">
                <dt pdk-visually-hidden>Party name</dt>
                <dd>{{ party | displayName }}</dd>
              </div>
              @if (party.dateOfBirth) {
              <div>
                <dt>Date of birth</dt>
                <dd>{{ party.dateOfBirth | date : 'd MMMM yyyy' }}</dd>
              </div>
              }
            </div>
            <div
              class="app-search-result__content"
              [class.app-search-result__content--open]="addressesExpanded"
            >
              <dt [attr.id]="addressId + '-' + i" pdk-visually-hidden>Address</dt>
              <dd>{{ getFormattedAddress(party) }}</dd>
            </div>
          </dl>
          }
        </div>

        <pdk-inset-text
          pdk-padding-vertical="0"
          pdk-padding-right="0"
          class="app-search-result__content"
          [class.app-search-result__content--open]="contentExpanded"
          [attr.id]="contentId"
          [attr.aria-labelledby]="summaryId"
        >
          <dl class="app-search-result__metadata">
            @if (result().parties.length === 1) {
            <div pdk-margin-bottom="4">
              <dt>Address</dt>
              <dd>{{ getFormattedAddress(result().parties[0]) }}</dd>
            </div>
            } @if (nextHearing) {
            <div class="app-search-result__row" pdk-margin-bottom="4">
              <div pdk-margin-right="2">
                <dt>Next hearing</dt>
                <dd>{{ nextHearing.hearingTypeLabel }}</dd>
              </div>
              <div>
                <dt pdk-visually-hidden>First hearing date</dt>
                <dd>{{ formattedNextHearingDates }}</dd>
              </div>
            </div>
            } @if (result().sjp) {
            <div pdk-margin-bottom="4">
              <dt>Notice served date</dt>
              <dd>{{ (result().sjpNoticeServed | date : 'd MMMM yyyy') || '-' }}</dd>
            </div>
            }
            <div pdk-margin-bottom="4">
              <dt>Prosecutor</dt>
              <dd>{{ result().prosecutingAuthority }}</dd>
            </div>
          </dl>
        </pdk-inset-text>

        @if (canUploadPostalReply) {
        <div pdk-margin-bottom="4">
          <a
            data-test-id="handle-postal-reply"
            href="javascript:void(0)"
            (click)="postalReply.emit(result())"
            pdk-link
          >
            Upload and enter postal reply
          </a>
        </div>
        } @if (getUncompletedApplications(result().applications).length > 0) {
        <details pdk-details pdk-margin-bottom="4">
          <summary>Applications</summary>
          <ul pdk-list pdk-margin-top="4">
            @for (application of getUncompletedApplications(result().applications); track
            application.applicationId) {
            <li>
              <a
                pdk-link
                href="javascript:void(0)"
                (click)="viewApplicationAtAGlance.emit(application)"
                data-test-id="view-application-at-a-glance"
              >
                {{ application.applicationType }}
              </a>
            </li>
            }
          </ul>
        </details>
        }
      </div>
    </section>
  `,
  imports: [
    DatePipe,
    PdkCore,
    PdkDetailsComponent,
    PdkDetailsDirective,
    PdkDetailsSummaryComponent,
    PdkInsetTextComponent,
    DisplayNamePipe
  ]
})
export class SearchResultCaseComponent {
  readonly result = input.required<UnifiedSearchCase>();
  readonly postalReply = output<UnifiedSearchCase>();
  readonly viewCrownCourtCase = output<UnifiedSearchCase>();
  readonly viewSjpCase = output<UnifiedSearchCase>();
  readonly viewApplicationAtAGlance = output<UnifiedSearchApplication | undefined>();

  addressesExpanded = false;
  contentExpanded = false;
  addressId = generateId('app-search-result-case-address');
  contentId = generateId('app-search-result-case-content');
  summaryId = generateId('app-search-result-case-summary');

  get addressIds(): string {
    return this.result().parties.reduce(
      (addressIds, _, i) => `${addressIds} ${this.addressId}-${i}`,
      ''
    );
  }

  get canUploadPostalReply(): boolean {
    const requiredCaseStatuses: UnifiedSearchCaseStatus[] = [
      'NO_PLEA_RECEIVED',
      'NO_PLEA_RECEIVED_READY_FOR_DECISION'
    ];

    const result = this.result();
    return Boolean(
      result.sjp && result.caseStatus && requiredCaseStatuses.includes(result.caseStatus)
    );
  }

  // TODO: @Jan 2020: while an SPI case should be recognised as `crownCourt =
  // true` this work is pending on the backend, so we must derive it from the
  // other values
  get TO_DEPRECATE_isSpiCase(): boolean {
    const result = this.result();
    return !result.sjp && !result.crownCourt && !result.magistrateCourt;
  }

  get nextHearing(): UnifiedSearchHearing | undefined {
    const result = this.result();
    if (result.hearings) {
      return result.hearings.find(
        hearing =>
          hearing.hearingDates.filter(hearingDate => isBefore(hearingDate, new Date())).length !==
          hearing.hearingDates.length
      );
    }
  }

  get formattedNextHearingDates(): string {
    if (this.nextHearing) {
      const sortedDates = sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime(),
        this.nextHearing.hearingDates
      );
      const date = format(sortedDates[0], 'D MMMM YYYY');

      return `${this.nextHearing.hearingDates.length > 0 ? 'From ' : ''} ${date}`;
    }
    return '';
  }

  getFormattedAddress({ addressLines, postCode }: UnifiedSearchParty): string {
    let address = '-';
    if (addressLines || postCode) {
      address = addressLines || '';
      if (postCode) {
        address = address.length === 0 ? postCode : `${address}, ${postCode}`;
      }
    }
    return address;
  }

  getUncompletedApplications(
    applications: UnifiedSearchApplication[] | undefined
  ): UnifiedSearchApplication[] {
    const applicationCompletedStatus = [ApplicationStatus.FINALISED, ApplicationStatus.EJECTED];
    return (applications || []).filter(
      ({ applicationStatus }) =>
        !!applicationStatus && !applicationCompletedStatus.includes(applicationStatus)
    );
  }
}
